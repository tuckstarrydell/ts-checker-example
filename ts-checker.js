const ts = require("typescript");

const code = `
const Foo = () => {
  return <div>{greeting}</div>;
};

const greeting = "Hello, World!";

export const Bar = Foo;

export const Baz = () => 123;
`;
const virtualFilePath = "index.tsx";
const service = ts.createLanguageService(
  {
    getScriptFileNames: () => [virtualFilePath],
    getScriptVersion: () => "0",
    getScriptSnapshot: (filePath) => {
      if (filePath === virtualFilePath) {
        return ts.ScriptSnapshot.fromString(code);
      } else {
        return ts.ScriptSnapshot.fromString(ts.sys.readFile(filePath));
      }
    },
    readFile: (filePath) => {
      if (filePath === virtualFilePath) {
        return code;
      } else {
        return ts.sys.readFile(filePath);
      }
    },
    fileExists: ts.sys.fileExists,
    directoryExists: ts.sys.directoryExists,
    getCompilationSettings: () => ({
      jsx: ts.JsxEmit.ReactJSX,
    }),
    getCurrentDirectory: () => process.cwd(),
    getDefaultLibFileName: ts.getDefaultLibFilePath,
  },
  ts.createDocumentRegistry()
);
const program = service.getProgram();
const sourceFile = program.getSourceFile(virtualFilePath);
const checker = program.getTypeChecker();
const detectedComponents = [];
for (const statement of sourceFile.statements) {
  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations) {
      const type = checker.getTypeAtLocation(declaration.name);
      for (const callSignature of type.getCallSignatures()) {
        const returnType = callSignature.getReturnType();
        if (returnType.symbol?.getEscapedName().toString() === "Element") {
          detectedComponents.push(declaration.name.text);
        }
      }
    }
  }
}
console.log(detectedComponents);
