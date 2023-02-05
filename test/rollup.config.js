const { readFile, writeFile } = require('fs/promises');
const { createPathTransform } = require('rollup-sourcemap-path-transform');

// Replace ../src/ with /test/ in source map sources
const sourcemapPathTransform = createPathTransform({
  prefixes: { '*src/': '/test/' },
  requirePrefix: true,
});

module.exports = [
  {
    input: 'src/source.js',
    output: {
      file: 'out/bundle.js',
      format: 'iife', // Karma cannot load ES modules
      sourcemap: true,
      sourcemapPathTransform,
      plugins: [{
        async writeBundle() {
          const bundle = await readFile('out/bundle.js', 'utf8');
          // Remove the source mapping URL
          const nomapref = bundle.replace(/\r?\n\/\/#\s*sourceMappingURL=.+$/m, '');
          await writeFile('out/bundle-nomapref.js', nomapref);
          // Set the source mapping URL to a missing file - append ".none" to it
          const missingmap = bundle.replace(/(\r?\n\/\/#\s*sourceMappingURL=.+)$/m, '$1.none');
          await writeFile('out/bundle-missingmap.js', missingmap);
          // Corrupt the source map content
          const corruptedmap = bundle.replace(/(\r?\n\/\/#\s*sourceMappingURL=bundle).+$/m, '$1-corruptedmap.js.map');
          await writeFile('out/bundle-corruptedmap.js', corruptedmap);
          await writeFile('out/bundle-corruptedmap.js.map', '{');
        }
      }]
    }
  },
  {
    input: 'src/shared.js',
    output: {
      file: 'out/shared.js',
      format: 'iife', // Karma cannot load ES modules
      name: 'shared',
      sourcemap: 'inline',
      sourcemapPathTransform,
      plugins: [{
        async writeBundle() {
          const shared = await readFile('out/shared.js', 'utf8');
          const map = /\r?\n\/\/#\s*sourceMappingURL=data:application\/json;charset=utf-8;base64,(.+)$/m.exec(shared)[1];
          // Create a raw (URI-encoded) source map
          const raw = shared.replace(/(\r?\n\/\/#\s*sourceMappingURL=data:application\/json).+$/m,
            `$1,${encodeURIComponent(Buffer.from(map, 'base64').toString())}`);
          await writeFile('out/shared-raw.js', raw);
          // Make the source mapping URL invalid by replacing `,` with `;`
          const invalid = shared.replace(/(\r?\n\/\/#\s*sourceMappingURL=data:application\/json).+$/m,
            `$1;${encodeURIComponent(Buffer.from(map, 'base64').toString())}`);
          await writeFile('out/shared-invalid.js', invalid);
          // Corrupt the source map content
          const corrupted = shared.replace(/(\r?\n\/\/#\s*sourceMappingURL=data:application\/json).+$/m,
            '$1;charset=utf-8;base64,ewo=');
          await writeFile('out/shared-corrupted.js', corrupted);
        }
      }]
    }
  },
];
