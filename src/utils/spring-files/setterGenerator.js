// Sample input proto file content as a string
const protoFileContent = `
message ListadoRegulado {
    string R04_deu_dir_vig = 1;
    string R04_deu_dir_30_90 = 2;
    // ... add more fields as needed
}
`;

// Function to convert snake_case to camelCase, including numbers
function toCamelCase(snakeCaseStr) {
    return snakeCaseStr.replace(/_([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());
}

// Function to generate Java builder function
function generateProtoBuilder(protoContent) {
    const lines = protoContent.split('\n');
    const fieldRegex = /^\s*string\s+([A-Za-z0-9_]+)\s*=\s*\d+;/;
    const fields = [];

    // Extract fields from proto content
    for (let line of lines) {
        const match = line.match(fieldRegex);
        if (match) {
            fields.push(match[1]);
        }
    }

    // Generate Java builder function
    const builderLines = [
        'ListadoRegulado listadoRegulado = ListadoRegulado.newBuilder()'
    ];
    for (let field of fields) {
        const camelCaseField = toCamelCase(field);
        const upperCaseField = field.toUpperCase();
        builderLines.push(`    .set${camelCaseField.charAt(0).toUpperCase() + camelCaseField.slice(1)}(productTraits.get("${upperCaseField}"))`);
    }
    builderLines.push('    .build();');

    // Print the result
    console.log(builderLines.join('\n'));
}

// Run the function with the sample proto content
generateProtoBuilder(protoFileContent);
