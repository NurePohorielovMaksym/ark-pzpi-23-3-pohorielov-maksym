// feedmate/backend/src/config/uploadToImageKit.js
import fs from 'fs';
import { imagekit } from '../config/imagekit.js';

export async function uploadToImageKit(file) {
  if (!file) return null;

  const fileBuffer = fs.readFileSync(file.path);

  const res = await imagekit.upload({
    file: fileBuffer,             
    fileName: file.originalname,  
    folder: '/collectify-products'
  });

  return res.url;                 
}