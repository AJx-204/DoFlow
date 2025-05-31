import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
   try {
      const transporter = nodemailer.createTransport({
         service:'gmail',
         auth:{
             user:process.env.EMAIL_USER,
             pass:process.env.EMAIL_PASS
         }
      });
      const mailOptions = {
         from: `${process.env.EMAIL_USER}`,
         to,
         subject,
         html,
      };
      await transporter.sendMail(mailOptions);
   } catch (error) {
      throw new Error('Failed to send email');
   };
};