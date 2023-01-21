function fetchFile(name) {
  const url = `/base/out/${name}`;
  return fetch(url).then(response => response.text());
}

describe('the preprocessor', () => {
  it('remaps sources in a base64 inline source map', async () => {
    const content = await fetchFile('shared.js');
    expect(content).toBe(`var shared = (function () {
  'use strict';

  function shared() {
    console.log();
  }

  return shared;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlcyI6WyIvdGVzdC9zaGFyZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2hhcmVkKCkge1xuICBjb25zb2xlLmxvZygpO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztFQUFlLFNBQVMsTUFBTSxHQUFHO0VBQ2pDLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0VBQ2hCOzs7Ozs7OzsifQ==
`);
  });

  it('leaves a valid external source map reference intact', async () => {
    const code = await fetchFile('bundle.js');
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
//# sourceMappingURL=bundle.js.map
`);
  });

  it('leaves the code without an external source map reference intact', async () => {
    const code = await fetchFile('bundle-nomapref.js');
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
`);
  });
});
