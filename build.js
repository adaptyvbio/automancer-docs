import mdx from '@mdx-js/esbuild';
import Mustache from 'mustache';
import esbuild from 'esbuild';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as ReactDOMServer from 'react-dom/server';
import { jsx } from 'react/jsx-runtime';
import glob from 'tiny-glob';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const template = (await fs.readFile(__dirname + '/templates/index.html')).toString();


let rawPaths = await glob(__dirname + '/src/**/*.mdx', { absolute: true });
let tmpPath = __dirname + '/tmp-01';

await esbuild.build({
  entryPoints: rawPaths,
  outdir: tmpPath,
  format: 'esm',
  plugins: [mdx({ allowDangerousRemoteMdx: true })],
  bundle: true,
  minify: true
});


let procPaths = await glob(tmpPath + '/**/*.js', { absolute: true });
let entries = [];
let tree = {
  children: {},
  entry: null
};

for (let absPath of procPaths) {
  let relPath = path.relative(tmpPath, absPath);
  // let outPath = __dirname + '/dist/' + relPath.replace(/\.js$/, '.html');

  let imported = await import(absPath);

  let addr = relPath.slice(0, -3);
  let segments = addr.split('/');
  let lastSegment = segments.at(-1);
  let addrSegments = segments.slice(0, (lastSegment === 'index') ? -1 : Infinity);
  let relTree = tree;

  for (let segment of addrSegments) {
    if (!(segment in relTree.children)) {
      relTree.children[segment] = {
        children: {},
        entry: null
      };
    }

    relTree = relTree.children[segment];
  }

  let entry = {
    imported,
    title: imported.title,
    outPath: [...addrSegments, 'index'].join('/') + '.html',
    outUrl: '/' + addrSegments.join('/') + '/',
    segments: addrSegments,
    sourcePath: relPath
  };

  relTree.entry = entry;
  entries.push(entry);
}


// console.log(entries)

for (let entry of entries) {
  let lastAncestor = tree;
  let ancestors = entry.segments.map((segment) => {
    let ancestor = lastAncestor.children[segment];
    lastAncestor = ancestor;
    return ancestor.entry;
  });

  // let navigation = (entry.segments.length > 0)
  //   ? Object.values(tree.children[entry.segments[0]].children).map(({ entry }) => ({ entry }))
  //   : Object.values(tree.children).map(({ entry }) => ({ entry }));

  let navigation;

  if (entry.segments.length > 0) {
    let firstAncestor = tree.children[entry.segments[0]];
    navigation = Object.values(firstAncestor.children).map(({ children, entry }) => ({
      children: Object.values(children).map(({ entry }) => ({ entry })),
      entry
    }));
  } else {
    navigation = Object.values(tree.children).map(({ entry }) => ({
      children: null,
      entry
    }));
  }

  let outPath = __dirname + '/dist/' + entry.outPath;
  let outDirPath = path.dirname(outPath);
  let element = jsx(entry.imported.default, {});
  let elementText = ReactDOMServer.renderToString(element);
  let fullText = Mustache.render(template, {
    breadcumb: [...ancestors.slice(0, -1), entry],
    contents: elementText,
    navigation,
    sectionEntry: (ancestors[0] ?? null),
    stylesPath: '../'.repeat(ancestors.length) + 'styles.css',
    title: entry.title ?? 'Untitled'
  });

  await fs.mkdir(outDirPath, { recursive: true });
  await fs.writeFile(outPath, fullText);

  // console.log(ancestors)
}

// import * as util from 'util';
// console.log(util.inspect(tree, { colors: true, depth: Infinity }));
