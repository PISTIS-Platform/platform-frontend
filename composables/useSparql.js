export const useSparql = () => {
    const executeSparqlQuery = async (query, format = 'application/sparql-results+json') => {
        try {
            const result = await $fetch('/api/catalog/sparql', {
                method: 'GET',
                query: {
                    query: query,
                    format: format,
                },
            });

            return result;
        } catch (error) {
            throw new Error(`SPARQL query failed: ${error.message}`);
        }
    };

    const checkDatasetExists = async (datasetId) => {
        const query = `
      PREFIX dcat: <http://www.w3.org/ns/dcat#>
      PREFIX pistis: <https://www.pistis-project.eu/ns/voc#>

      ASK {
        ?dataset a dcat:Dataset ;
                 pistis:offer ?offer .
        
        ?offer pistis:marketplaceOfferId "${datasetId}" .
      }
    `;

        const result = await executeSparqlQuery(query);
        return result.boolean;
    };

    return {
        executeSparqlQuery,
        checkDatasetExists,
    };
};
