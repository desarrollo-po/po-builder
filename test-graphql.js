#!/usr/bin/env node

/**
 * Test script for prensaobrera.com GraphQL endpoint
 * Usage: node test-graphql.js
 */

const endpoint = "https://admin.prensaobrera.com/graphql";

const query = `
  query GetPosts($first: Int!) {
    posts(first: $first) {
      edges {
        node {
          id
          title
          slug
          campos {
            descripcionDestacado
            volanta
          }
          date
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const variables = {
  first: 10,
};

console.log("🔍 Testing GraphQL endpoint:", endpoint);
console.log("📄 Query:\n", query);
console.log("📋 Variables:", variables);
console.log("\n🚀 Sending request...\n");

fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ query, variables }),
})
  .then((res) => {
    console.log("📥 Status:", res.status, res.statusText);
    console.log("📥 Headers:", Object.fromEntries(res.headers.entries()));
    return res.json();
  })
  .then((data) => {
    if (data.errors) {
      console.log("❌ GraphQL Errors:");
      data.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.message}`);
        if (err.extensions) {
          console.log(`     ${JSON.stringify(err.extensions)}`);
        }
      });
    } else {
      console.log("✅ Success!");
      console.log("📊 Posts:", data.data.posts.edges.length);
      if (data.data.posts.edges.length > 0) {
        console.log("📌 First post:");
        const post = data.data.posts.edges[0].node;
        console.log(`   - ID: ${post.id}`);
        console.log(`   - Title: ${post.title}`);
        console.log(`   - Excerpt: ${post.campos?.descripcionDestacado?.substring(0, 50)}...`);
      }
    }
  })
  .catch((err) => {
    console.log("❌ Network Error:", err.message);
  });
