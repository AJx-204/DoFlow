import Organization from "../model/org.js";
import Team from "../model/Team.js";
import Project from "../model/project/Project.js";
import Section from "../model/project/Section.js";
import Task from "../model/project/Task.js";
import User from "../model/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { asyncFunc } from "../utils/asyncFunc.js";
import { select } from "three/tsl";


const getOrg = asyncFunc(async(req, res)=>{
    const org = req.org;
    const populatedOrg = await org
    .populate([
        { 
            path: 'createdBy', 
            select: 'userName email profilePhoto' 
        },{ 
            path: 'members.member', 
            select: 'userName email profilePhoto' 
        },{
            path:"teams", 
            select:"teamName members",
            populate:{
                path:"members.member",
                select:"userName email profilePhoto"
            },
        },{
            path:"projects",
            populate:([
        {
            path:"createdBy",
            select:"userName email profilePhoto"
        },{
            path:'inOrg',
            select:"orgName"
        },{
            path:"teams",
            select:"teamName members",
            populate:{
                path:"members.member",
                select:"userName email profilePhoto"
            }
        },{
            path:"members.member",
            select:"userName email profilePhoto"
        },{
            path:"projectSections",
            populate:[
                {
                    path:"createdBy",
                    select:"userName email profilePhoto"
                },{
                    path:"assignedToTeam",
                    select:"teamName members",
                    populate:{
                        path:"members.member",
                        select:"userName email profilePhoto"
                    }
                },{
                    path:"assignedToMember",
                    select:"userName email profilePhoto"
                },{
                    path:"tasks",
                   populate:[
                            {
                                path:"createdBy",
                                select:"userName email profilePhoto"
                            },{
                                path:"assignedToTeam",
                                select:"teamName members",
                                populate:{
                                    path:"members.member",
                                    select:"userName email profilePhoto"
                                }
                            },{
                                path:"assignedToMember",
                                select:"userName email profilePhoto"
                            },{
                                path:"subTasks",
                                select:"addedBy",
                                populate:{
                                    path:"addedBy",
                                    select:"userName email profilePhoto"
                                }
                            },{
                                path:"comments",
                                select:"addedBy",
                                populate:{
                                    path:"addedBy",
                                    select:"userName email profilePhoto"
                                }
                            },{
                                path:"links",
                                select:"addedBy",
                                populate:{
                                    path:"addedBy",
                                    select:"userName email profilePhoto"
                                }
                            },{
                                path:"attachments",
                                select:"addedBy",
                                populate:{
                                    path:"addedBy",
                                    select:"userName email profilePhoto"
                                }
                            }
                        ]
                    }
                ]
            }
        ])
        }
    ])
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedOrg,
            "Organization fetch successfully !"
        )
    );
});

const getProject = asyncFunc(async(req, res)=>{
    const project = req.project;
    const populatedProject = await project
    .populate([
        {
            path:"createdBy",
            select:"userName email profilePhoto"
        },{
            path:"teams",
            select:"teamName members",
            populate:{
                path:"members.member",
                select:"userName email profilePhoto"
            }
        },{
            path:"members.member",
            select:"userName email profilePhoto"
        },{
            path:"projectSections",
            populate:[
                {
                    path:"createdBy",
                    select:"userName email profilePhoto"
                },{
                    path:"assignedToTeam",
                    select:"teamName members",
                    populate:{
                        path:"members.member",
                        select:"userName email profilePhoto"
                    }
                },{
                    path:"assignedToMember",
                    select:"userName email profilePhoto"
                },{
                    path:"tasks",
                    populate:[
                        {
                            path:"createdBy",
                            select:"userName email profilePhoto"
                        },{
                            path:"assignedToTeam",
                            select:"teamName members",
                            populate:{
                                path:"members.member",
                                select:"userName email profilePhoto"
                            }
                        },{
                            path:"assignedToMember",
                            select:"userName email profilePhoto"
                        },{
                            path:"subTasks",
                            select:"addedBy",
                            populate:{
                                path:"addedBy",
                                select:"userName email profilePhoto"
                            }
                        },{
                            path:"comments",
                            select:"addedBy",
                            populate:{
                                path:"addedBy",
                                select:"userName email profilePhoto"
                            }
                        },{
                            path:"links",
                            select:"addedBy",
                            populate:{
                                path:"addedBy",
                                select:"userName email profilePhoto"
                            }
                        },{
                            path:"attachments",
                            select:"addedBy",
                            populate:{
                                path:"addedBy",
                                select:"userName email profilePhoto"
                            }
                        }
                    ]
                }
            ]
        }
    ]);
    return res.status(200)
    .json(
        new ApiRes(
            200,
            populatedProject,
            "Project fetch successfully"
        )
    );
});


export {
    getOrg,
    getProject,
}