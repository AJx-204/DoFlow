import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import Task from '../model/project/Task.js';
import Section from "../model/project/Section.js";
import { uploadOnCloudinary } from "../service/Cloudinary.js";


const createTask = asyncFunc(async(req, res)=>{
    const { sectionId } = req.params;
    const user = req.user;
    const project = req.project;
    const {
        title,
        description,
        priority,
        status,
        assignedToTeam = [],
        assignedToMember = [],
        subTasks = [],
        comments = [],
        links = [],
        deadline
    } = req.body;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    if(!title){
        throw new ApiError(
            400,
            "Task Title is required"
        )
    };
    const section = await Section.findById(sectionId);
    if (!section) {
       throw new ApiError(
         404, 
         "Section not found"
       );
    }
    const isSectionInProject = project.projectSections.find(
        (s) => s.toString() === sectionId.toString()
    );
    if(!isSectionInProject){
        throw new ApiError(
            404,
            "The section is not part of this project"
        )
    };
    const teamIds = Array.isArray(assignedToTeam) ? assignedToTeam : [assignedToTeam];
    const memberIds = Array.isArray(assignedToMember) ? assignedToMember : [assignedToMember];
    if(teamIds.length > 0){
        const isTeamsInProject  = teamIds.every(
            teamIds => project.teams.some(
                (t) => t.toString() == teamIds.toString()
            )
        );
        if(!isTeamsInProject){
            throw new ApiError(
                404,
                "some team are not part of this Project"
            )
        };
    }
    if(memberIds.length > 0){
        const isMembersInProject = memberIds.every(
            memberIds => project.members.some(
                (m) => m.member.toString() == memberIds.toString()
            )
        );
        if(!isMembersInProject){
            throw new ApiError(
                404,
                "some members are not part of this Project"
            )
        };
    }
    const processedSubTasks = (Array.isArray(subTasks) ? subTasks : []).map(st => {
        if (!st.title || st.title.trim() === '') {
          throw new ApiError(400, "Each subtask must have a title");
        }
        return {
          addedBy: user._id,
          title: st.title.trim(),
          description: st.description?.trim() || '',
          isCompleted: st.isCompleted || false,
        };
    });
    const processedComments = (Array.isArray(comments) ? comments : []).map(c => {
        if (!c.text || c.text.trim() === '') {
          throw new ApiError(400, "Each comment must have text");
        }
        return {
          addedBy: user._id,
          text: c.text.trim(),
        };
    });
    const processedLinks = (Array.isArray(links) ? links : []).map(l => {
       if (!l.url || l.url.trim() === '') {
         throw new ApiError(400, "Each link must have a URL");
       }
       return {
         addedBy: user._id,
         label: l.label?.trim() || '',
         url: l.url.trim(),
         addedAt: l.addedAt ? new Date(l.addedAt) : new Date()
       };
    });
    let attachments = []
    if(req.files && req.files.length > 0){
        const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
        const uploadedResults = await Promise.all(uploadPromises);
        attachments = uploadedResults
        .filter(result => result !== null)
        .map(result => ({
            addedBy:user._id,
            fileName: result.original_filename,
            fileUrl: result.url,
            addedAt: new Date()
        }))
    };
    const task = await Task.create({
        createdBy:user._id,
        title,
        description,
        priority,
        status,
        assignedToMember:memberIds,
        assignedToTeam:teamIds,
        inSection: sectionId,
        subTasks: processedSubTasks,
        comments: processedComments,
        links: processedLinks,
        attachments,
        deadline
    });
    if(!task){
        throw new ApiError(
            500,
            "Failed to create task, please try again later"
        )
    };
    section.tasks.push(task._id)
    await section.save();
    const populatedTask = await task.populate([
        {
            path:"createdBy",
            select:"userName profilePhoto email"
        },{
            path:"assignedToTeam",
            select:"teamName"
        },{
            path:"assignedToMember",
            select:"userName profilePhoto email"
        },{
            path:"subTasks.addedBy",
            select:"userName profilePhoto email"
        },{
            path:"comments.addedBy",
            select:"userName profilePhoto email"
        },{
            path:"links.addedBy",
            select:"userName profilePhoto email"
        },{
            path:'attachments.addedBy',
            select:"userName profilePhoto email"
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedTask,
            "Task created successfully"
        )
    );
});

const updateTask = asyncFunc(async(req, res)=>{
    const user = req.user;
    const userRole  =  req.projectRole
    const project = req.project;
    const { sectionId, taskId } = req.params;
    const { title, description, status, priority,assignedToTeam = [],
        assignedToMember = [],} = req.body;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const isTaskInsection = task.inSection.toString() == sectionId.toString();
    if(!isTaskInsection){
        throw new ApiError(
            404,
            "Task not found in this section"
        )
    }
    const isTaskCreator = task.createdBy.toString() == user._id.toString();
    const permittedRoles = ["admin", "moderator", "leader"];
    const isPermitted = isTaskCreator || permittedRoles.includes(userRole);
    if (!isPermitted) {
        throw new ApiError(
            403, 
            "You do not have permission to update this task"
        );
    }
    const teamIds = Array.isArray(assignedToTeam) ? assignedToTeam : [assignedToTeam];
    const memberIds = Array.isArray(assignedToMember) ? assignedToMember : [assignedToMember];
    if(teamIds.length > 0){
        const isTeamsInProject  = teamIds.every(
            teamIds => project.teams.some(
                (t) => t.toString() == teamIds.toString()
            )
        );
        if(!isTeamsInProject){
            throw new ApiError(
                404,
                "some team are not part of this Project"
            )
        };
    }
    if(memberIds.length > 0){
        const isMembersInProject = memberIds.every(
            memberIds => project.members.some(
                (m) => m.member.toString() == memberIds.toString()
            )
        );
        if(!isMembersInProject){
            throw new ApiError(
                404,
                "some members are not part of this Project"
            )
        };
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (assignedToMember !== undefined) task.assignedToMember = memberIds;
    if(assignedToTeam !== undefined) task.assignedToTeam = teamIds;
    await task.save();
    const populatedTask = await task.populate([
        {
            path:"createdBy",
            select:"userName profilePhoto email"
        },{
            path:"assignedToTeam",
            select:"teamName"
        },{
            path:"assignedToMember",
            select:"userName profilePhoto email"
        },{
            path:"subTasks.addedBy",
            select:"userName profilePhoto email"
        },{
            path:"comments.addedBy",
            select:"userName profilePhoto email"
        },{
            path:"links.addedBy",
            select:"userName profilePhoto email"
        },{
            path:'attachments.addedBy',
            select:"userName profilePhoto email"
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedTask,
            "Task updated successfully"
        )
    );
});

const deleteTask = asyncFunc(async(req, res)=>{
    const user = req.user;
    const userRole = req.projectRole;
    const project = req.project;
    const { sectionId, taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const isTaskInsection = task.inSection.toString() == sectionId.toString();
    if(!isTaskInsection){
        throw new ApiError(
            404,
            "Task not found in this sections"
        )
    }
    const isTaskCreator = task.createdBy.toString() == user._id.toString();
    const permittedRoles = ["admin", "moderator", "leader"];
    const isPermitted = isTaskCreator || permittedRoles.includes(userRole);
    if (!isPermitted) {
        throw new ApiError(
            403, 
            "You do not have permission to delete this task"
        );
    };
    await Section.findByIdAndUpdate(task.inSection,{
        $pull:{
            tasks:taskId
        }
    });
    await task.deleteOne();
    return res.status(201)
    .json(
        new ApiRes(
            201,
            null,
            "task deleted successfully"
        )
    )
});

const addSubtask = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { title, description, isCompleted } = req.body;
    const { taskId, sectionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    if(!title){
        throw new ApiError(
            403,
            "subTask title is required"
        )
    };
    const task = await Task.findOne({
        _id:taskId,
        inSection:sectionId
    });
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const subtask = {
        addedBy:user._id,
        title,
        description,
        isCompleted
    };
    task.subTasks.push(subtask);
    await task.save();
    const popoulatedTask = await task.populate({
        path:"subTasks.addedBy",
        select:"userName email profilePhoto"
    })
    return res.status(200)
    .json(
        new ApiRes(
            200,
             popoulatedTask.subTasks,
            "subTask added successfully"
        )
    )
});

const updateSubtask = asyncFunc(async(req, res)=>{
    const user = req.user;
    const userRole = req.projectRole;
    const { taskId, subTaskId } = req.params;
    const { title, description, isCompleted } = req.body;
    if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
        throw new ApiError(400, "Invalid subTask ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const subTask = task.subTasks.id(subTaskId);
    if(!subTask){
        throw new ApiError(
            404,
            "subTask not found"
        )
    };
    const isSubTaskCreaator = subTask.addedBy.toString() === user._id.toString();
    const isTaskCreator = task.createdBy.toString() === user._id.toString();
    const permittedRoles = ["admin", "moderator", "leader"];
    const isPermitted = isSubTaskCreaator || isTaskCreator || permittedRoles.includes(userRole);
    if (!isPermitted) {
        throw new ApiError(
            403, 
            "You do not have permission to update this subTask"
        );
    };
    if (title !== undefined) subTask.title = title;
    if (description !== undefined) subTask.description = description;
    if (isCompleted !== undefined) subTask.isCompleted = isCompleted;
    await task.save();
    const popoulatedTask = await task.populate({
        path:"subTasks.addedBy",
        select:"userName email profilePhoto"
    })
    return res.status(200)
    .json(
        new ApiRes(
            200,
            popoulatedTask.subTasks,
            "subTask updated successfully"
        )
    );
});

const deleteSubtask = asyncFunc(async(req, res)=>{
    const user = req.user;
    const userRole = req.projectRole;
    const {sectionId, taskId, subTaskId } = req.params; 
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
        throw new ApiError(400, "Invalid subTask ID");
    };
    const task = await Task.findOne({
      _id: taskId,
      inSection: sectionId
    });
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const subTask = task.subTasks.id(subTaskId);
    if(!subTask){
        throw new ApiError(
            404,
            "subTask not found"
        )
    };
    const isSubTaskCreaator = subTask.addedBy.toString() === user._id.toString();
    const isTaskCreator = task.createdBy.toString() === user._id.toString();
    const permittedRoles = ["admin", "moderator", "leader"];
    const isPermitted = isSubTaskCreaator || isTaskCreator || permittedRoles.includes(userRole);
    if (!isPermitted) {
        throw new ApiError(
            403, 
            "You do not have permission to delete this subTask"
        );
    };
    task.subTasks.pull(subTaskId);
    await task.save();
    const popoulatedTask = await task.populate({
       path:"subTasks.addedBy",
       select:"userName email profilePhoto"
    })
    return res.status(200)
    .json(
        new ApiRes(
            200,
            popoulatedTask.subTasks,
            "Task removed successfully"
        )
    );
});

const addComment = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId } = req.params;
    const { sectionId } = req.params;
    const { text } = req.body;
    if(!text){
        throw new ApiError(
            400,
            "Text is required to add comment"
        )
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    const task = await Task.findByIdAndUpdate({
        _id:taskId,
        inSection:sectionId
    },{
        $push:{
            comments:{
                text,
                addedBy:user._id
            }
        }
    },{ new: true}).populate({
        path:"comments.addedBy",
        select:"userName email profilePhoto"
    });
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    return res.status(200)
    .json(
        new ApiRes(
            200,
            task.comments,
            "Comment added successfully"
        )
    );
});

const deleteComment = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId, commentId } = req.params;
     if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const comment = task.comments.id(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    };
    const isCommentOwner = comment.addedBy.toString() === user._id.toString();
    const isTaskOwner = task.createdBy.toString() === user._id.toString();
    const canDeleteComment = isCommentOwner || isTaskOwner ;
    if(!canDeleteComment){
        throw new ApiError(
            403,
            "You do not have permission to delete this comment"
        )
    };
    task.comments.pull(comment._id);
    await task.save();
    const populatedTask = await task.populate({
        path:"comments.addedBy",
        select:"userName email profilePhoto"
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedTask.comments,
            "comment deleted successfully"
        )
    );
});

const addLink = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId } = req.params;
    const { sectionId } = req.params;
    const { label, url } = req.body;
    if(!url || !label){
        throw new ApiError(
            400,
            "Url and label both are required"
        )
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    const task = await Task.findByIdAndUpdate({
        _id:taskId,
        inSection:sectionId
    },{
        $push:{
            links:{
                label,
                url,
                addedBy:user._id
            }
        }
    },{ new: true}).populate({
        path:"links.addedBy",
        select:"userName email profilePhoto"
    });
    if (!task) {
       throw new ApiError(404, "Task not found");
    }
    return res.status(200)
    .json(
        new ApiRes(
            200,
            task.links,
            "Link added successfully"
        )
    );
});

const deleteLink = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId, linkId } = req.params;
     if (!mongoose.Types.ObjectId.isValid(linkId)) {
        throw new ApiError(400, "Invalid comment ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const link = task.links.id(linkId);
    if (!link) {
      throw new ApiError(404, "Link not found");
    };
    const isCommentOwner = link.addedBy.toString() === user._id.toString();
    const isTaskOwner = task.createdBy.toString() === user._id.toString();
    const canDeleteComment = isCommentOwner || isTaskOwner ;
    if(!canDeleteComment){
        throw new ApiError(
            403,
            "You do not have permission to delete this Link"
        )
    };
    task.links.pull(link._id);
    await task.save();
    const populatedTask = await task.populate({
        path:"links.addedBy",
        select:"userName email profilePhoto"
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedTask.links,
            "Link deleted successfully"
        )
    );
});

const addAttachment = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId, sectionId } = req.params;
    if(!req.file){
        throw new ApiError(
            400,
            "File is required"
        )
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        throw new ApiError(400, "Invalid section ID");
    };
    const result = await uploadOnCloudinary(req.file.path);
    if (!result || !result.url) {
       throw new ApiError(500, "File upload failed");
    };
    const task = await Task.findOneAndUpdate(
      { _id: taskId, inSection: sectionId },
      {
        $push: {
          attachments: {
            addedBy: user._id,
            fileName: req.file.originalname,
            fileUrl: result.url,
          }
        }
      },
      { new: true }
    ).populate({
      path: "attachments.addedBy",
      select: "userName email profilePhoto"
    });
    if (!task) {
        throw new ApiError(
            404, 
            "Task not found"
        );
    };
    return res.status(200)
    .json(
        new ApiRes(
            200, 
            task.attachments, 
            "Attachment added successfully"
        )
    );  
});

const deleteAttachment = asyncFunc(async(req, res)=>{
    const user = req.user;
    const { taskId, attachmentId } = req.params;
     if (!mongoose.Types.ObjectId.isValid(attachmentId)) {
        throw new ApiError(400, "Invalid Attachment ID");
    };
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid task ID");
    };
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(
            404,
            "Task not found"
        )
    };
    const attachment = task.attachments.id(attachmentId);
    if (!attachment) {
      throw new ApiError(404, "Attachment not found");
    };
    const isCommentOwner = attachment.addedBy.toString() === user._id.toString();
    const isTaskOwner = task.createdBy.toString() === user._id.toString();
    const canDeleteComment = isCommentOwner || isTaskOwner ;
    if(!canDeleteComment){
        throw new ApiError(
            403,
            "You do not have permission to delete this attachment"
        )
    };
    task.attachments.pull(attachment._id);
    await task.save();
    const populatedTask = await task.populate({
        path:"attachments.addedBy",
        select:"userName email profilePhoto"
    });
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedTask.attachments,
            "attachment deleted successfully"
        )
    );
});


export {
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    deleteComment,
    addLink,
    deleteLink,
    addAttachment,
    deleteAttachment,
}