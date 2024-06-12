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
string R04_deu_dir_vig = 2; string R04_deu_dir_30_90 = 3; string R04_deu_dir_180_3 = 4; 
string R04_deu_dir_op_financ = 5; string R04_NI = 6; string R04_deu_ind_vig = 7; 
string R04_deu_ind_30_3 = 8; string R04_deu_comercial = 9; string R04_deu_consumo = 10; 
string R04_NK = 11; string R04_deu_vivienda = 12; string R04_deu_dir_mayor_3 = 13; 
string R04_deu_ind_mayor_3 = 14; string R04_mto_lin_dis = 15; string R04_deu_conting = 16; 
string R04_deu_dir_90_180 = 17
`;

const mappings = convertProtoFileToMappings(protoFile);

// Output the mappings
console.log(mappings.join('\n'));
