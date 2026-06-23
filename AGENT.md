## Esquema de post:
```graphql
posts() {
    edges {
        node {
            id
            title
            slug
            campos {
            descripcionDestacado
                volanta
            }
            categories {
            edges {
                node {
                name
                slug
                }
            }
            }
            featuredImage {
            node {
                sourceUrl(size: MEDIUM)
            }
            }
        }
    }
}
```