import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, email, clerkId, gender, birthDate } = await request.json();

    if (!name || !email || !clerkId || !gender || !birthDate) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const response = await sql`
      INSERT INTO users (name, email, clerk_id, gender, birth_date)
      VALUES (${name}, ${email}, ${clerkId}, ${gender}, ${birthDate})
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const url = new URL(request.url);
    const clerkId = url.searchParams.get("clerkId");

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "clerkId is required" }), {
        status: 400,
      });
    }

    const user = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;

    if (user.length === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user[0]), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
