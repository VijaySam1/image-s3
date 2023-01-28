import {bind} from '@loopback/context';
import multer from 'multer';
import sharp from 'sharp';
@bind({tags: {name: 'sharp'}})
export class ImageUploadService {
  async resize(image: string, id: string): Promise<any> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});
    return sharp(`public/uploads/${image}`)
      .resize(320, 320)
      .toFile(`public/uploads/resized/${id}.jpg`, (err, info) => {
        if (err) throw err;
        return info;
      });
  }
}
