import * as fs from 'fs';
import * as path from 'path';

// Helper function to get all .proto files recursively
const getProtoFiles = (dir: string, fileList: string[] = []): string[] => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getProtoFiles(filePath, fileList);
        } else if (filePath.endsWith('.proto')) {
            fileList.push(filePath);
        }
    });
    return fileList;
};

// Function to read and parse a proto file
const parseProtoFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const packageMatch = content.match(/package\s+([\w.]+);/);
    const javaPackageMatch = content.match(/option\s+java_package\s*=\s*"([\w.]+)";/);
    const messageMatch = content.match(/message\s+(\w+)\s*{[^}]*}/g);
    const importMatches = [...content.matchAll(/import\s+"([\w/.]+)";/g)];

    const packageName = packageMatch ? packageMatch[1] : '';
    const javaPackageName = javaPackageMatch ? javaPackageMatch[1] : '';
    const messages = messageMatch ? messageMatch.map(m => m) : [];
    const imports = importMatches.map(m => m[1]);

    return { packageName, javaPackageName, messages, imports };
};

// Function to convert proto message to Java bean class
const generateJavaClass = (javaPackage: string, message: string, imports: string[], packageName: string): string => {
    const className = message.match(/message\s+(\w+)/)?.[1] || 'Unknown';
    const fields = [...message.matchAll(/\s*(\w+)\s+(\w+)\s*=\s*\d+;/g)].map(match => {
        const fieldType = match[1];
        const fieldName = match[2];
        return `private ${convertProtoTypeToJava(fieldType)} ${fieldName};`;
    });

    const importStatements = imports.map(imp => {
        // Adjusting import paths to fit the Java structure
        const importPath = imp.replace('.proto', '').replace(/\//g, '.');
        return `import ${javaPackage}.${importPath};`;
    });

    return `
package ${javaPackage};

${importStatements.join('\n')}
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

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
    return typeMapping[protoType] || protoType;
};

// Main function to process proto files
const processProtoFiles = (srcDir: string, distDir: string) => {
    const protoFiles = getProtoFiles(srcDir);

    protoFiles.forEach(protoFile => {
        const { packageName, javaPackageName, messages, imports } = parseProtoFile(protoFile);

        messages.forEach(message => {
            const javaClass = generateJavaClass(javaPackageName, message, imports, packageName);

            // Define the output path and ensure directory exists
            const relativePath = path.relative(srcDir, protoFile);
            const outputFilePath = path.join(distDir, relativePath.replace('.proto', '.java'));
            const outputDir = path.dirname(outputFilePath);
            fs.mkdirSync(outputDir, { recursive: true });

            // Write the Java class to the output file
            fs.writeFileSync(outputFilePath, javaClass, 'utf-8');
        });
    });
};

// Entry point of the script
const srcDir = 'path/to/proto/files';  // Replace with the actual path
const distDir = path.join(srcDir, 'dist');
processProtoFiles(srcDir, distDir);

console.log('Java classes generated successfully.');
