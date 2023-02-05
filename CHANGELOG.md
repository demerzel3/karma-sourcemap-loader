# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2022-02-05

### Added

- Allow remapping or otherwise changing source paths in source maps
- Allow changing `sourceRoot` in source maps
- Allow adapting the source map files alone, if served separately by the Karma web server
- Add option `onlyWithURL` to disable the source map loading for files without `sourceMappingURL`
- Add option `strict` for a strict error handling of invalid and/or missing source maps

### Fixed

- Fix handling of raw (URI-encoded) source maps - trim the leading , before parsing the content
- Warn about a missing external source map, is the source mapping URL is invalid
- Handle malformed source map content as a warning or failure
