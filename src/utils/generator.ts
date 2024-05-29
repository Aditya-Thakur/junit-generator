import * as fs from 'fs';
import * as path from 'path';

interface Field {
    name: string;
    type: string;
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
    const fieldMatches = [...content.matchAll(/private\s+([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+);/g)];
    const constructorMatch = content.match(/public\s+[a-zA-Z0-9_]+\s*\(([^)]*)\)\s*{/);

    if (!packageNameMatch || !classNameMatch) {
        throw new Error('Invalid POJO file: ' + filePath);
    }

    const packageName = packageNameMatch[1];
    const className = classNameMatch[1];
    const fields: Field[] = fieldMatches.map(match => ({
        type: match[1],
        name: match[2]
    }));

    const hasConstructor = !!constructorMatch;

    return { packageName, className, fields, hasConstructor };
}

// Generate JUnit test content for a POJO class
function generateTestContent(pojo: PojoClass): string {
    const imports = [
        'import org.junit.jupiter.api.BeforeEach;',
        'import org.junit.jupiter.api.Test;',
        'import org.mockito.InjectMocks;',
        'import static org.assertj.core.api.Assertions.assertThat;',
        'import static org.junit.jupiter.api.Assertions.assertEquals;'
    ];

    const setupMethod = `
  @BeforeEach
  public void setup() {
    ${pojo.className.toLowerCase()} = new ${pojo.className}();
  }
  `;

    const testMethods = pojo.fields.map(field => {
        const fieldName = field.name;
        const fieldValue = field.type === 'String' ? `"${fieldName}"` : '1';
        return `
    @Test
    void set${capitalize(fieldName)}Test() {
      ${pojo.className.toLowerCase()}.set${capitalize(fieldName)}(${fieldValue});
      assertThat(${pojo.className.toLowerCase()}.get${capitalize(fieldName)}()).isNotNull();
      assertEquals(${fieldValue}, ${pojo.className.toLowerCase()}.get${capitalize(fieldName)}());
    }
    `;
    }).join('\n');

    const constructorTestMethod = pojo.hasConstructor ? `
  @Test
  void constructorTest() {
    ${pojo.className} ${pojo.className.toLowerCase()}1 = new ${pojo.className}(${pojo.fields.map(field => field.type === 'String' ? `"${field.name}"` : '1').join(', ')});
    ${pojo.fields.map(field => `assertEquals("${field.name}", ${pojo.className.toLowerCase()}1.get${capitalize(field.name)}());`).join('\n    ')}
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
    const report: Report = {
        totalFiles: pojoFiles.length,
        generatedFiles: 0,
        skippedFiles: [],
        generatedFileDetails: []
    };

    pojoFiles.forEach(filePath => {
        const pojo = parsePojoFile(filePath);

        if (pojo.fields.some(field => field.type !== 'String')) {
            report.skippedFiles.push(filePath);
            return;
        }

        const testContent = generateTestContent(pojo);
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
