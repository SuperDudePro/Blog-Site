import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const IMAGE_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);
const ALLOWED_FIELDS = new Set([
  'slug', 'title', 'excerpt', 'section', 'publishedAt', 'modifiedAt', 'displayDate',
  'status', 'heroImage', 'heroAlt', 'cardImage', 'cardAlt', 'bodyHtml',
]);

function text(node, sourceFile) {
  return node ? node.getText(sourceFile) : '';
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return undefined;
}

function templateValue(node, sourceFile) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (!ts.isTemplateExpression(node)) return undefined;
  let value = node.head.text;
  for (const span of node.templateSpans) {
    value += `\${${span.expression.getText(sourceFile)}}${span.literal.text}`;
  }
  return value;
}

function staticString(node, sourceFile, constants) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) return templateValue(node, sourceFile);
  if (ts.isIdentifier(node)) return constants.get(node.text);
  return undefined;
}

export function parsePostSource(source, indexPath = 'index.ts') {
  const sourceFile = ts.createSourceFile(indexPath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const errors = sourceFile.parseDiagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  const constants = new Map();
  const imageImports = new Map();
  let postObject;
  let defaultExport = false;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const moduleName = statement.moduleSpecifier.text;
      if (moduleName === '../../postTypes') continue;
      const identifier = statement.importClause?.name?.text;
      const extension = path.extname(moduleName).toLowerCase();
      if (identifier && moduleName.startsWith('./') && IMAGE_EXTENSIONS.has(extension)) {
        imageImports.set(identifier, moduleName.replace(/^\.\//, ''));
      } else {
        errors.push(`unsupported import: ${text(statement, sourceFile)}`);
      }
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      if ((statement.declarationList.flags & ts.NodeFlags.Const) === 0) {
        errors.push('top-level variables must use const');
      }
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) {
          errors.push(`unsupported declaration: ${text(declaration, sourceFile)}`);
          continue;
        }
        const name = declaration.name.text;
        if (name === 'post') {
          if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) postObject = declaration.initializer;
          else errors.push('post must be assigned directly to an object literal');
          continue;
        }
        const value = staticString(declaration.initializer, sourceFile, constants);
        if (typeof value === 'string') constants.set(name, value);
        else errors.push(`unsupported top-level constant '${name}'`);
      }
      continue;
    }

    if (ts.isExportAssignment(statement) && !statement.isExportEquals && ts.isIdentifier(statement.expression) && statement.expression.text === 'post') {
      defaultExport = true;
      continue;
    }

    if (!ts.isEmptyStatement(statement)) errors.push(`unsupported top-level statement: ${text(statement, sourceFile)}`);
  }

  if (!postObject) errors.push('missing const post object');
  if (!defaultExport) errors.push('file must export default post');

  const values = new Map();
  const identifiers = new Map();
  const fields = new Set();
  if (postObject) {
    for (const property of postObject.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = propertyName(property.name);
        if (!name) {
          errors.push(`unsupported property: ${text(property, sourceFile)}`);
          continue;
        }
        fields.add(name);
        if (!ALLOWED_FIELDS.has(name)) errors.push(`unknown BlogPost field '${name}'`);
        if (ts.isIdentifier(property.initializer)) identifiers.set(name, property.initializer.text);
        values.set(name, staticString(property.initializer, sourceFile, constants));
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const name = property.name.text;
        fields.add(name);
        if (!ALLOWED_FIELDS.has(name)) errors.push(`unknown BlogPost field '${name}'`);
        identifiers.set(name, name);
        values.set(name, constants.get(name));
      } else {
        errors.push(`unsupported property: ${text(property, sourceFile)}`);
      }
    }
  }

  return {
    errors,
    constants,
    imageImports,
    values,
    identifiers,
    fields,
    bodyHtml: values.get('bodyHtml') || '',
  };
}
