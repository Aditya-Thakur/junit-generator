function convertProtoFileToMappings(protoFile) {
    // Step 1: Split the input by ';' to get individual declarations
    const declarations = protoFile.split(';').map(decl => decl.trim()).filter(decl => decl);

    // Step 2: Initialize an array to hold the mapping strings
    const mappings = [];

    // Step 3: Process each declaration
    declarations.forEach(declaration => {
        // Use a regular expression to extract components (type, name, index)
        const regex = /(\w+)\s+([\w_]+)\s*=\s*(\d+);?/;
        const match = declaration.match(regex);

        if (match) {
            const [ , , varName] = match;

            // Convert the variable name from snake_case to camelCase
            let camelCaseName = varName.replace(/(_\w)/g, match => match[1].toUpperCase());

            // Ensure the first character is lowercase
            camelCaseName = camelCaseName.charAt(0).toLowerCase() + camelCaseName.slice(1);

            // Construct the mapping string
            const mapping = `@Mapping(source = "${camelCaseName}", target = "${varName}")`;

            // Add the mapping to the array
            mappings.push(mapping);
        } else {
            console.warn(`Invalid declaration: ${declaration}`);
        }
    });

    // Return the array of mapping strings
    return mappings;
}

// Example usage:
const protoFile = `
string R04_deu_dir_vig = 2; 
`;

const mappings = convertProtoFileToMappings(protoFile);

// Output the mappings
console.log(mappings.join('\n'));
