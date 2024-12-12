# my-custom-package

## 创建 README.md 文件

```bash
touch README.md
```

## 创建 package.json 文件

```bash
npm init -y
```

## 安装依赖包

```bash
npm install --save-dev vite
```

## 修改 package.json

```json
{
  "name": "@kaoniqiwa/my-custom-package",
  "version": "1.0.0",
  "scripts": {
    "dev": "npm run clear:cache && vite",
    "build": "vite build",
    "preview": "npm run build && vite preview",
    "clear:cache": "rm -rf node_modules/.vite "
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "devDependencies": {
    "vite": "^6.0.3"
  }
}
```

vite 会对 node_modules 中的包进行预构建，在手动修改包内容时需要删除缓存以展示最新修改。

## 创建 index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>my-custom-package</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

## 创建 src/main.js

```js
console.log('Hello, my-custom-package!');
```

## 测试项目基架

```bash
npm run dev
```

控制台输出:`Hello, my-custom-package!`

## 创建自定义包 @kaoniqiwa/my-trina

```bash
mkdir packages && cd packages
mkdir my-trina && cd my-trina
touch package.json
touch README.md
```

@kaoniqiwa/my-trina/package.json

```json
{
  "name": "@kaoniqiwa/my-trina",
  "version": "1.0.0",
  "description": "A custom package",
  "main": "dist/index.js",
  "scripts": {},
  "keywords": ["custom", "package"],
  "author": "kaoniqiwa",
  "license": "MIT"
}
```

注意这里入口文件为 dist/index.js

## 创建 @kaoniqiwa/my-trina 包内容

dist/index.js

```js
function hello() {
  console.log('@kaoniqia/my-trina cjs');
}
module.exports = {
  hello,
};
```

注意这里是 commonjs 规范.

## 将 my-trina 整个目复制动到 node_modules/@kaoniqiwa 下

1. @kaoniqiwa/my-trina 包并未在 package.json 中注册，一旦重新运行 `npm install ???`指令，该包将被删除,启动 vite 时，@kaoniqiwa/my-trina 的缓存被删除
2. @kaoniqiwa/my-trina 包作为 commonjs 规范的包，在 node_modules 中真实存在，会被 vite 预构建为 esm 规范。
3. 如果 @kaoniqiwa/my-trina 在 node_modules 是软连接形式，不会被 vite 预构建。

## 更新 src/main.js

```js
import { hello } from '@kaoniqiwa/my-trina';

hello();
```

vite 的预构建会将 commonjs 的包转为 esm 规范.从而在源码中可使用 esm 规范导入.

## 测试自定义包

```bash
npm run dev
```

控制台输出:`@kaoniqiwa/my-trina cjs`

## 修改 src/main.js

```js
const { hello } = require('@kaoniqiwa/my-trina');
hello();
```

将 esm 规范改为 commonjs 规范.重新测试 `npm run dev`.
报错:Uncaught ReferenceError: require is not defined

为了解决在源码中使用 commonjs 规范导入,需要安装 vite-plugin-commonjs 插件。不是 @rollup/plugin-commonjs.

## 新建 vite.config.js

```js
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs()],
});
```

vite 自动重新读取 vite.config.js 文件,并加载插件。浏览器控制台输出:`@kaoniqiwa/my-trina cjs`

注意:

1. commonjs 包会被 vite 预构建为 esm 规范,所以在源码中可使用 esm 规范导入.
2. 源码中使用 commonjs 规范，需要安装 vite-plugin-commonjs 插件。

## @kaoniqiwa/my-trina 新增 esm 规范

dist/index.mjs

```js
function hello() {
  debugger;
  console.log('@kaoniqiwa/my-trina esm');
}
export { hello };
```

## 更新 @kaoniqiwa/my-trina/package.json

```json
{
  "name": "@kaoniqiwa/my-trina",
  "version": "1.0.0",
  "description": "A custom package",
  "main": "dist/index.js",
 + "module": "dist/index.mjs",
  "scripts": {},
  "keywords": ["custom", "package"],
  "author": "kaoniqiwa",
  "license": "MIT"
}
```

## 测试自定义包

src/main.js

```js
import { hello } from '@kaoniqiwa/my-trina';
hello();
```

或者

```js
const { hello } = require('@kaoniqiwa/my-trina');
hello();
```

输出的都是:`@kaoniqiwa/my-trina esm`。因为当 @kaoniqiwa/my-trina 包配置了 module 字段时，打包工具 vite 会优先加载 module 字段指定的 esm 包。如果没有 module 字段，会查询 exports 字段，如果 exports 字段存在，则会加载 exports 字段指定的 esm 包。如果 exports 字段不存在，才会加载 main 字段指定的 cjs 包。

## 关于 vite 的预构建

1. 将 commonjs 包预构建为 esm 规范。
2. 预构建的 esm 包会被缓存，下次启动 vite 时，会优先使用缓存的 esm 包。
3. 将 esm 包所有的依赖预构建为一个文件

安装 lodash-es,该包有 600+内置模块，当引入 lodash-es 包时，会请求 600+ 个文件。

src/main.js

```js
import { clone } from 'lodash-es';
console.log(clone({ a: 1, b: 2 }));
```

vite 默认会预构建 node_modules 中的项目依赖，比如源码中使用了 lodash-es 包，vite 发现该包在 node_modules 中，则会自动预构建 lodash-es 包。

1. 先关闭预构建，看看问题出在哪里

vite.config.js

```js
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
  plugins: [commonjs()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['lodash-es'],
  },
});
```

optimizeDeps.exclude 字段可以排除预构建的依赖。

2. 再次启动 vite，看看问题出现在哪里
   2.1 vite 启动后，在 node_modules/.vite/deps 中没有 lodash-es 的预构建结果，说明 lodash-es 包没有被预构建。
   2.2 在浏览器的网络中，看到加载了 600+ 的文件，因为 lodash-es 的入口文件导出了 600+个模块，导致浏览器加载了 600+个文件。

## 创建自定义包 @kaoniqiwa/my-adsame

包内容和 @kaoniqiwa/my-trina 一样，只是包名不同。

## 使用 @kaoniqiwa/my-adsame

这次不是复制到 node_modules 中，而是通过 `npm install ./packages/my-adsame`

package.json

```json
{
  "dependencies": {
    "@kaoniqiwa/my-adsame": "file:packages/my-adsame"
  }
}
```

```bash
$ ls -l node_modules/@kaoniqiwa/my-adsame
# lrwxr-xr-x  1 panminxiang  staff  24 Dec 11 16:25 node_modules/@kaoniqiwa/my-adsame -> ../../packages/my-adsame
```

可以看到 node_modules/@kaoniqiwa/my-adsame 是一个软链接。

## 测试 @kaoniqiwa/my-adsame

src/main.js

```js
import { hello } from '@kaoniqiwa/my-adsame';
hello();
```

控制台输出:`@kaoniqiwa/my-adsame esm`

注意 @kaoniqiwa/my-adsame 不会被 vite 预构建

## 测试 @kaoniqiwa/my-adsame 包的 cjs 版本

/test.cjs

```js
const { hello } = require('@kaoniqiwa/my-adsame');
hello();
```

## 创建自定义包 @kaoniqiwa/my-howell

包内容和 @kaoniqiwa/my-trina 一样，只是包名不同。

在 my-howell 目录下创建 src/index.js

手动打包 @kaoniqiwa/my-howell

```bash
$ npm pack
npm notice
npm notice 📦  @kaoniqiwa/my-howell@1.0.0
npm notice Tarball Contents
npm notice 0B README.md
npm notice 94B dist/index.js
npm notice 82B dist/index.mjs
npm notice 420B package.json
npm notice 30B src/main.js
npm notice Tarball Details
npm notice name: @kaoniqiwa/my-howell
npm notice version: 1.0.0
npm notice filename: kaoniqiwa-my-howell-1.0.0.tgz
npm notice package size: 504 B
npm notice unpacked size: 626 B
npm notice shasum: abe8235363e84dcb0e930ec348564e64b1a6a5bd
npm notice integrity: sha512-45G4G426koQbs[...]knCeoZ3yerZ9Q==
npm notice total files: 5
npm notice
kaoniqiwa-my-howell-1.0.0.tgz
```

注意这里将 src/main.js 也打包进了包中。为了避免这种情况，有两种方式：

1. 在 package.json 中设置 "files": ["dist"]，这样只会打包 dist 目录。
2. 在 .npmignore 文件中设置 "src"，这样不会打包 src 目录。

## howell

`npm i ./packages/my-howell/kaoniqiwa-my-howell-1.0.0.tgz`

## jquery

```bash
# 查找 tar 包的地址
npm view jquery
....
dist
.tarball: https://registry.npmmirror.com/jquery/-/jquery-3.7.1.tgz
.shasum: 083ef98927c9a6a74d05a6af02806566d16274de
.integrity: sha512-m4avr8yL8kmFN8psrbFFFmB/If14iN5o9nw/NgnnM+kybDJpRsAynV2BsfpTYrTRysYUdADVD7CkUUizgkpLfg==
.unpackedSize: 1.2 MB

# 安装 tar 包
npm i https://registry.npmmirror.com/jquery/-/jquery-3.7.1.tgz
```

## mitt

```bash
# 查看 mitt 包的 仓库地址
$ npm view mitt repository
#{ type: 'git', url: 'git+https://github.com/developit/mitt.git' }

# 通过 git 地址安装
$ npm i git+https://github.com/developit/mitt.git
```
