// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import runParser from '../../lib/parser';

// todo: add support to input a link or drag and drop.
// process.cwd -> goes to the root of this project
const currentProjectPath = path.join(process.cwd(), 'pages');
// const otherPath = '/Users/richter/Downloads/playground/my-app/pages'; // put in some other path to check

type Data = {
  name: string
  children: object[]
}

interface newObj {
  name: string
  attributes: {
    path: string,
    // data: Record<string, unknown>
    dataRenderMethod: string,
    fetchURL: string
  }
  children: undefined|object[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data> // setting the type from line 8
) {

  function traverseDir(dir:string) {
    const validFileType:Array<string> = ['.ts', '.tsx', '.js', 'jsx'];
    const arr:object[] = [];
    fs.readdirSync(dir).forEach((file : string) => {
      const fullPath = path.join(dir, file);

      // validate if file type is valid or if it's a folder
      if (validFileType.includes(path.extname(file)) || fs.lstatSync(fullPath).isDirectory()) {
        const obj:newObj = {
          name: file,
          attributes: {
            path: fullPath,
            dataRenderMethod: '',
            fetchURL: ''
          },
          children: undefined
        }
        if (fs.lstatSync(fullPath).isDirectory()) {
          obj.children = traverseDir(fullPath);
        } else {
          // run parser to get node attributes
          const data = runParser(fullPath);
          console.log('runParser data: ', data)
          obj.attributes.dataRenderMethod = data.renderMethod;
          obj.attributes.fetchURL = data.fetchURL;
        }
  
        arr.push(obj)
      } 

    });
    console.log('test',arr)
    return arr
  }
  if (req.method === 'POST') {
    const path = req.body.path;
    res.status(200).json({ name: 'Pages', children: traverseDir(path)})
  }else {
    // change the argument in traverseDir
    res.status(200).json({ name: 'Pages', children: traverseDir(currentProjectPath)})
  }

}
