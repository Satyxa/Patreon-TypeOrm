import { existsSync, mkdirSync, writeFile } from 'fs';
import { dirname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { createImageInfo, createViewImageInfo, ImageInfo } from '../Entities/Blog/Images/ImageInfo.entity';
import { createPostImageInfo, createPostViewImageInfo } from '../Entities/Posts/ImageInfo.entity';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { postsPS } from './PaginationAndSort';

export const imagesUtils = {
  async saveFileToAWS(originalName, buffer: Buffer, category = 'blogs', categoryId) {

    const s3Client = new S3Client({
      region: 'eu-central-1',
      credentials: {
        secretAccessKey: 'uo1uDO8zWGTIxY7FBEsd61hZB2UzimGtTWXjifKF',
        accessKeyId: 'AKIATCKASMZWC2VLA6MH',
      },
    })

    const bucketParams = {
      Bucket: 'patreon-typeorm',
      Key: `static/${category}/${categoryId}/${originalName}`,
      ContentType: 'image/jpg',
      Body: buffer
    }

    const command = new PutObjectCommand(bucketParams)

    try {
      await s3Client.send(command)
    } catch (err) {
      return console.log(err);
    }


  },

  imageValidation(img, requiredWidth, requiredHeight) {

    const imgSize = img.originalname.split('.')[0].split('-')[1]

    if(imgSize !== `${requiredWidth}x${requiredHeight}`)
      throw new BadRequestException([{
        field: 'image',
        message: 'invalid width or height'
      }])

    if(img.size > 100000)
      throw new BadRequestException([{
      field: 'image',
      message: 'too big'
    }])

    const imgFormat = img.mimetype.split('/')[1]

    if(imgFormat !== 'png' && imgFormat !== 'jpg' && imgFormat !== 'jpeg')
      throw new BadRequestException([{
        field: 'image',
        message: 'invalid format'
      }])

    return imgFormat
},

  getResizedImgAndImgInfo: async function(img, fileName, width,
                                          height, path, photoType,
                                          entityId) {
    const imgResized = await sharp(img.buffer)
      .resize({ width, height }).toBuffer();

    // const imgResizedFile = await sharp(img.buffer)
    //   .resize({ width, height });

    const { size = 0 } = await sharp(imgResized).metadata();


    await this.saveFileToAWS(fileName, imgResized, 'posts', entityId);

    return new createPostImageInfo(entityId, path,
      height, width, size, photoType);

  },

  async getWallpaperAndMainsImagesForBlog(BlogImageInfoRepository, blogId, type) {
    const result = await BlogImageInfoRepository
      .createQueryBuilder("i")
      .where("i.blogId = :blogId", {blogId})
      .andWhere("i.type = :type", {type})
      .getMany()
    if(type === 'main')
      return result.map((i: ImageInfo) =>
      new createViewImageInfo(i.url,
        i.height, i.width, i.fileSize))

    else
      return result[0]
        ? new createViewImageInfo(result.url, result.height,
          result.width, result.fileSize)
        : null

  }
}