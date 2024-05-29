import * as fs from 'fs';
import * as path from 'path';

interface Field {
    name: string;
    type: string;
    isList: boolean;
}

interface PojoClass {
    packageName: string;
    className: string;
    fields: Field[];
    hasConstructor: boolean;
}

interface Report {
    totalFiles: number;
    generatedFiles: number;
    skippedFiles: string[];
    generatedFileDetails: { name: string, path: string }[];
}

// Recursively find the 'beans' directory starting from 'src/main/java'
function findBeansDir(baseDir: string): string | null {
    const srcMainJavaPath = path.join(baseDir, 'src', 'main', 'java');
    const stack = [srcMainJavaPath];

    while (stack.length) {
        const currentDir = stack.pop();
        if (!currentDir) continue;

        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file === 'beans') {
                    return fullPath;
                }
                stack.push(fullPath);
            }
        }
    }

    return null;
}

// Recursively read all POJO files from the 'beans' directory and its subdirectories
function getPojoFiles(dir: string): string[] {
    let pojoFiles: string[] = [];

    function readDirRecursively(currentDir: string) {
        const files = fs.readdirSync(currentDir);
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                readDirRecursively(fullPath);
            } else if (file.endsWith('.java')) {
                pojoFiles.push(fullPath);
            }
        }
    }

    readDirRecursively(dir);
    return pojoFiles;
}

// Parse a POJO file to extract package name, class name, fields, and constructor
function parsePojoFile(filePath: string): PojoClass {
    const content = fs.readFileSync(filePath, 'utf-8');
    const packageNameMatch = content.match(/package\s+([a-zA-Z0-9_.]+);/);
    const classNameMatch = content.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
    const fieldMatches = [...content.matchAll(/private\s+([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+);/g)];
    const constructorMatch = content.match(/public\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)\s*{/);

    if (!packageNameMatch || !classNameMatch) {
        throw new Error('Invalid POJO file: ' + filePath);
    }

    const packageName = packageNameMatch[1];
    const className = classNameMatch[1];
    const fields: Field[] = fieldMatches.map(match => ({
        type: match[1].replace(/^List<|>$/g, ''),
        name: match[2],
        isList: match[1].startsWith('List<')
    }));

    const hasConstructor = !!constructorMatch;

    return { packageName, className, fields, hasConstructor };
}

// Generate JUnit test content for a POJO class
function generateTestContent(pojo: PojoClass, allPojos: Map<string, PojoClass>): string {
    const imports = [
        'import org.junit.jupiter.api.BeforeEach;',
        'import org.junit.jupiter.api.Test;',
        'import org.mockito.InjectMocks;',
        'import java.util.ArrayList;',
        'import java.util.List;',
        'import static org.assertj.core.api.Assertions.assertThat;',
        'import static org.junit.jupiter.api.Assertions.assertEquals;',
    ];

    const setupMethod = `
  @BeforeEach
  public void setup() {
    ${pojo.className.toLowerCase()} = new ${pojo.className}();
  }
  `;

    const testMethods = pojo.fields.map(field => {
        const fieldName = field.name;
        const fieldValue = getDefaultValue(field.type, field.isList, allPojos);
        const fieldAssert = getFieldAssert(pojo.className.toLowerCase(), field, fieldValue);

        return `
    @Test
    void set${capitalize(fieldName)}Test() {
      ${pojo.className.toLowerCase()}.set${capitalize(fieldName)}(${fieldValue});
      ${fieldAssert}
    }
    `;
    }).join('\n');

    const constructorTestMethod = pojo.hasConstructor ? `
  @Test
  void constructorTest() {
    ${pojo.className} ${pojo.className.toLowerCase()}1 = new ${pojo.className}(${pojo.fields.map(field => getDefaultValue(field.type, field.isList, allPojos)).join(', ')});
    ${pojo.fields.map(field => getConstructorAssert(pojo.className.toLowerCase() + '1', field)).join('\n    ')}
  }
  ` : '';

    return `
  package ${pojo.packageName};

  ${imports.join('\n')}

  public class ${pojo.className}Test {
    @InjectMocks
    private ${pojo.className} ${pojo.className.toLowerCase()};

    ${setupMethod}

    ${testMethods}

    ${constructorTestMethod}
  }
  `;
}

// Helper function to get the default value for a field
function getDefaultValue(type: string, isList: boolean, allPojos: Map<string, PojoClass>): string {
    if (isList) {
        const listElementType = type;
        if (listElementType === 'String') {
            return 'new ArrayList<>(List.of("element1", "element2"))';
        } else if (listElementType === 'Integer') {
            return 'new ArrayList<>(List.of(1, 2))';
        } else if (allPojos.has(listElementType)) {
            const elementValue = getDefaultValue(listElementType, false, allPojos);
            return `new ArrayList<>(List.of(${elementValue}, ${elementValue}))`;
        } else {
            return 'new ArrayList<>()';
        }
    } else {
        if (type === 'String') {
            return `"${type.toLowerCase()}"`;
        } else if (type === 'Integer') {
            return '1';
        } else if (allPojos.has(type)) {
            const pojo = allPojos.get(type)!;
            return `new ${type}(${pojo.fields.map(field => getDefaultValue(field.type, field.isList, allPojos)).join(', ')})`;
        } else {
            return 'null';
        }
    }
}

// Helper function to generate assertions for a field
function getFieldAssert(instanceName: string, field: Field, fieldValue: string): string {
    if (field.isList) {
        return `
    assertThat(${instanceName}.get${capitalize(field.name)}()).isNotNull();
    assertThat(${instanceName}.get${capitalize(field.name)}().size()).isGreaterThan(0);
    `;
    } else {
        return `
    assertThat(${instanceName}.get${capitalize(field.name)}()).isNotNull();
    assertEquals(${fieldValue}, ${instanceName}.get${capitalize(field.name)}());
    `;
    }
}

// Helper function to generate constructor assertions for a field
function getConstructorAssert(instanceName: string, field: Field): string {
    if (field.isList) {
        return `
    assertThat(${instanceName}.get${capitalize(field.name)}()).isNotNull();
    assertThat(${instanceName}.get${capitalize(field.name)}().size()).isGreaterThan(0);
    `;
    } else {
        return `
    assertThat(${instanceName}.get${capitalize(field.name)}()).isNotNull();
    assertEquals(${getDefaultValue(field.type, field.isList, new Map())}, ${instanceName}.get${capitalize(field.name)}());
    `;
    }
}

// Helper function to capitalize the first letter of a string
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main function to generate JUnit test files
function generateTests(baseDirPath: string): Report {
    const beansDir = findBeansDir(baseDirPath);
    if (!beansDir) {
        throw new Error('Beans directory not found');
    }

    const pojoFiles = getPojoFiles(beansDir);
    const pojos: Map<string, PojoClass> = new Map();

    pojoFiles.forEach(filePath => {
        const pojo = parsePojoFile(filePath);
        pojos.set(pojo.className, pojo);
    });

    const report: Report = {
        totalFiles: pojoFiles.length,
        generatedFiles: 0,
        skippedFiles: [],
        generatedFileDetails: []
    };

    pojoFiles.forEach(filePath => {
        const pojo = parsePojoFile(filePath);

        const testContent = generateTestContent(pojo, pojos);
        const testFilePath = filePath
            .replace(path.join('src', 'main'), path.join('src', 'test'))
            .replace(/\.java$/, 'Test.java');

        fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
        fs.writeFileSync(testFilePath, testContent, 'utf-8');

        report.generatedFiles++;
        report.generatedFileDetails.push({ name: path.basename(testFilePath), path: testFilePath });
    });

    return report;
}

// Run the script with a sample base directory path
const report = generateTests('./path/to/your/project');

console.log('Test File Generation Report:');
console.log('Total Files:', report.totalFiles);
console.log('Generated Files:', report.generatedFiles);
console.log('Skipped Files:', report.skippedFiles);
console.log('Generated File Details:', report.generatedFileDetails);
console.log('Success Percentage:', (report.generatedFiles / report.totalFiles) * 100, '%');
