const ts = require("typescript");

const filePath = "example.jsx";
const options = {
  allowJs: true,
  jsx: "preserve",
};
const host = ts.createCompilerHost(options);
const program = ts.createProgram([filePath], options, host);
const sourceFile = program.getSourceFile(filePath);
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
