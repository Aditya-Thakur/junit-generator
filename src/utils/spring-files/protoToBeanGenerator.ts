import * as fs from 'fs';
import * as path from 'path';

// Helper function to get all .proto files recursively with their relative paths
const getProtoFilesWithRelativePaths = (dir: string, rootDir: string, fileList: { filePath: string, relativePath: string }[] = []): { filePath: string, relativePath: string }[] => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getProtoFilesWithRelativePaths(filePath, rootDir, fileList);
        } else if (filePath.endsWith('.proto')) {
            const relativePath = path.relative(rootDir, filePath);
            fileList.push({ filePath, relativePath });
        }
    });
    return fileList;
};

// Function to read and parse a proto file
const parseProtoFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const packageMatch = content.match(/package\s+([\w.]+);/);
    const javaPackageMatch = content.match(/option\s+java_package\s*=\s*"([\w.]+)";/);
    const messageMatch = content.match(/message\s+\w+\s*{[^}]*}/g);
    const importMatches = [...content.matchAll(/import\s+"([\w/.]+)";/g)];

    const packageName = packageMatch ? packageMatch[1] : '';
    const javaPackageName = javaPackageMatch ? javaPackageMatch[1] : '';
    const messages = messageMatch ? messageMatch.map(m => m) : [];
    const imports = importMatches.map(m => m[1]);

    return { packageName, javaPackageName, messages, imports };
};

// Function to convert the first letter of a string to uppercase
const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Function to convert proto message to Java bean class
const generateJavaClass = (javaPackage: string, message: string, imports: string[], packageName: string): string => {
    const className = capitalizeFirstLetter(message.match(/message\s+(\w+)/)?.[1] || 'Unknown');
    
    // Updated regex to capture both repeated and non-repeated fields
    const fieldMatches = [...message.matchAll(/^\s*(repeated\s+)?(\w+)\s+(\w+)\s*=\s*\d+;/gm)];
    
    const fields = fieldMatches.map(match => {
        const isRepeated = match[1] !== undefined;  // Check if 'repeated' is captured
        const fieldType = match[2];
        const fieldName = match[3];
        
        if (isRepeated) {
            return `private List<${convertProtoTypeToJava(fieldType)}> ${fieldName};`;
        } else {
            return `private ${convertProtoTypeToJava(fieldType)} ${fieldName};`;
        }
    });

    const importStatements = [
        ...new Set(
            imports.map(imp => {
                // Adjusting import paths to fit the Java structure
                const importPath = imp.replace('.proto', '').replace(/\//g, '.');
                return `import ${javaPackage}.${importPath};`;
            })
        ),
        ...((fields.some(f => f.includes('List<'))) ? ['import java.util.List;'] : []) // Add List import if there are repeated fields
    ];

    return `
package ${javaPackage};

${importStatements.join('\n')}
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ${className} {
    ${fields.join('\n    ')}
}
`;
};


// Function to convert proto types to Java types (this is basic, expand as needed)
const convertProtoTypeToJava = (protoType: string): string => {
    const typeMapping: { [key: string]: string } = {
        'string': 'String',
        'int32': 'int',
        'int64': 'long',
        'bool': 'boolean',
        'double': 'double',
        'float': 'float'
        // Add more mappings as needed
    };
    return typeMapping[protoType] || capitalizeFirstLetter(protoType);
};

// Main function to process proto files
const processProtoFiles = (srcDir: string, distDir: string) => {
    const protoFiles = getProtoFilesWithRelativePaths(srcDir, srcDir);

    protoFiles.forEach(protoFile => {
        const { filePath, relativePath } = protoFile;
        const { packageName, javaPackageName, messages, imports } = parseProtoFile(filePath);

        messages.forEach(message => {
            const className = capitalizeFirstLetter(message.match(/message\s+(\w+)/)?.[1] || 'Unknown');
            const javaClass = generateJavaClass(javaPackageName, message, imports, packageName);

            // Define the output path and ensure directory exists
            const outputFilePath = path.join(distDir, relativePath.replace('.proto', '.java'));
            const outputDir = path.dirname(outputFilePath);
            const capitalizedFilePath = path.join(outputDir, `${className}.java`);
            fs.mkdirSync(outputDir, { recursive: true });

            // Write the Java class to the output file
            fs.writeFileSync(capitalizedFilePath, javaClass, 'utf-8');
        });
    });
};

// Entry point of the script
const srcDir = 'path/to/proto/files';  // Replace with the actual path
const distDir = path.join(srcDir, 'dist');
processProtoFiles(srcDir, distDir);

console.log('Java classes generated successfully.');
