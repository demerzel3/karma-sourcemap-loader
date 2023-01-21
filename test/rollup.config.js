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
        }
      }]
    }
  },
  {
    input: 'src/shared.js',
    output: {
      file: 'out/shared.js',
      format: 'iife',
      name: 'shared',
      sourcemap: 'inline',
      sourcemapPathTransform
    }
  },
];
