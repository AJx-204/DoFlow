import multer from "multer";

// const allowedMimeTypes = [
//   // Images
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "image/webp",
//   "image/avif",
//   "image/heic",
//   "image/heif",
//   "image/tiff",
//   "image/bmp",
//   "image/vnd.microsoft.icon",  // ico

//   // Videos
//   "video/mp4",
//   "video/webm",
//   "video/ogg",
//   "video/avi",
//   "video/quicktime",   // mov
//   "video/x-flv",
//   "video/3gpp",
//   "video/mpeg",
//   "video/mp2t",        // mts, m2ts

//   // Audio
//   "audio/mpeg",        // mp3
//   "audio/wav",
//   "audio/ogg",
//   "audio/mp4",         // m4a
//   "audio/aac",
//   "audio/flac",

//   // Raw / Documents
//   "application/pdf",
//   "application/msword",                   // doc
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
//   "application/vnd.ms-word.document.macroEnabled.12", // docm
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.template", // dotx
//   "application/rtf", // rtf
//   "text/plain", // txt
//   "application/vnd.ms-excel",             // xls
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
//   "application/vnd.ms-excel.sheet.macroEnabled.12", // xlsm
//   "application/vnd.ms-powerpoint",        // ppt
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
//   "application/vnd.ms-powerpoint.presentation.macroEnabled.12", // pptm
//   "application/vnd.ms-powerpoint.template.macroEnabled.12", // potm
//   "application/vnd.openxmlformats-officedocument.presentationml.template", // potx
//   "application/vnd.ms-powerpoint.template", // pot
//   "application/vnd.ms-powerpoint.slideshow.macroEnabled.12", // ppsm
//   "application/vnd.ms-powerpoint.slideshow", // pps
//   "text/csv",
//   "application/json",
//   "application/xml",
  
//   // Fonts
//   "font/otf",
//   "font/ttf",
//   "font/woff",
//   "font/woff2",
//   "application/font-woff",
//   "application/vnd.ms-fontobject",  
// ];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});

// const fileFilter = (req, file, cb) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);  // accept file
//   } else {
//     cb(new Error("Unsupported file format"), false); // reject file
//   }
// };
  
export const upload = multer({ 
   storage,
   limits: {
    fileSize: 10 * 1024 * 1024, 
  },
})