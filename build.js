import mdx from '@mdx-js/esbuild';
import esbuild from 'esbuild';
import * as fs from 'fs/promises';
import minimist from 'minimist';
import * as path from 'path';
import * as ReactDOMServer from 'react-dom/server';
import { jsx } from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import glob from 'tiny-glob';
import { fileURLToPath } from 'url';


const args = minimist(process.argv.slice(2));

let siteUrl = args['site-url'] ?? '/';
siteUrl = siteUrl.endsWith('/') ? siteUrl : siteUrl + '/';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Compile pages

let pagesSourceDirPath = await glob(__dirname + '/src/**/*.mdx', { absolute: true });
let pagesCompiledDirPath = __dirname + '/tmp/build/01';

await esbuild.build({
  entryPoints: pagesSourceDirPath,
  outdir: pagesCompiledDirPath,
  format: 'esm',
  plugins: [mdx({
    allowDangerousRemoteMdx: true,
    remarkPlugins: [remarkGfm]
  })],
  bundle: true,
  minify: true
});


// Compile templates

let templatesCompiledDirPath = __dirname + '/tmp/build/02';

await esbuild.build({
  entryPoints: await glob(__dirname + '/templates/*.jsx', { absolute: true }),
  outdir: templatesCompiledDirPath,
  inject: [__dirname + '/templates/jsx-factory.js']
});


// Import templates

let { default: template } = await import(templatesCompiledDirPath + '/index.js');


// Execute pages

let procPaths = await glob(pagesCompiledDirPath + '/**/*.js', { absolute: true });
let entries = [];
let tree = {
  children: {},
  entry: null
};

for (let absPath of procPaths) {
  let relPath = path.relative(pagesCompiledDirPath, absPath);
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
    outUrl: [siteUrl.slice(0, -1), ...addrSegments].join('/') + '/',
    segments: addrSegments,
    sourcePath: relPath
  };

  relTree.entry = entry;
  entries.push(entry);
}


for (let entry of entries) {
  let lastAncestor = tree;
  let ancestors = entry.segments.map((segment) => {
    let ancestor = lastAncestor.children[segment];
    lastAncestor = ancestor;
    return ancestor.entry;
  });

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
  let fullText = '<!DOCTYPE html>' + template({
    breadcumb: [...ancestors.slice(0, -1), entry],
    contents: elementText,
    entry,
    navigation,
    sectionEntry: (ancestors[0] ?? null),
    siteUrl,
    title: entry.title ?? 'Untitled'
  });

  await fs.mkdir(outDirPath, { recursive: true });
  await fs.writeFile(outPath, fullText);
}
