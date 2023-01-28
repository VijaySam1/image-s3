import {bind} from '@loopback/context';
import sharp from 'sharp';
@bind({tags: {name: 'sharp'}})
export class SharpService {
  async resize(image: string, id: string): Promise<any> {
    return sharp(`public/uploads/${image}`)
      .resize(320, 320)
      .toFile(`public/uploads/resized/${id}.jpg`, (err, info) => {
        if (err) throw err;
        return info;
      });
  }
}
