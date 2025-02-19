import axios from 'axios';
import crypto from 'crypto';

function createAuthorization(
  accessKey: string,
  secretKey: string,
  query: string
): string {
  const signedDate = Date.now().toString();
  const queryReplace = query.replace(/\s+/g, ' ');
  const message = `${signedDate}.${queryReplace}`;
  const hash = crypto
    .createHmac('sha1', secretKey)
    .update(message)
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${hash}`;
}

async function fetchZigzagProduct(productId: string) {
  const url = 'https://openapi.zigzag.kr/1/graphql';

  const query = `
    query {
      product(id: "${productId}") {
        id
        name
        price
        category
        stock
      }
    }
  `;

  const accessKey = 'your-access-key';
  const secretKey = 'your-secret-key';
  const authorization = createAuthorization(accessKey, secretKey, query);

  try {
    const response = await axios.post(
      url,
      JSON.stringify({
        query: query.trim(),
        variables: {},
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
      }
    );

    console.log(
      '✅ Zigzag API Response:',
      JSON.stringify(response.data, null, 2)
    );
  } catch (error) {
    console.error('❌ Error fetching Zigzag API:', error);
  }
}

fetchZigzagProduct('100129206');
