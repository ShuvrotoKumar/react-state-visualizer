# Changelog

All notable changes to the "React State Visualizer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-04-05

### Added
- Initial release of React State Visualizer VS Code extension.
- **Core Engine**: AST-based `useState` and `useReducer` detection.
- **Sidebar Provider**: Interactive webview with glassmorphism and modern UI.
- **Timeline View**: Track state scan history during a session.
- **Unused State Detector**: Basic logic for finding declared but not used states.
- **Infinite Loop Warning**: Heuristic-based detection of potential render loops.
- **Jump to Code**: Easy navigation to state declarations.
