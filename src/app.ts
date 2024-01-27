import express, { Request, Response } from "express";
import { QueryConfig } from "pg";
import { client, pool } from "./db";

export const app = express();

type User = {
  id: number;
  email: string;
};

app.get("/users", async (req: Request, res: Response) => {
  const response = await pool.query<User>(`SELECT * FROM users;`);

  const users = response.rows;

  res.json(users);
});

app.get(
  "/users/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const query: QueryConfig = {
      text: `SELECT * FROM users WHERE id = $1;`,
      values: [id]
    };

    const response = await pool.query<User>(query);

    const users = response.rows;

    res.json(users[0]);
  }
);

app.post("/users", (req: Request, res: Response) => {});
app.patch("/users/:id", (req: Request, res: Response) => {});
app.delete("/users/:id", (req: Request, res: Response) => {});
app.get("/urls", async (req: Request, res: Response) => {
  const response = await pool.query<Url>(`SELECT * FROM urls;`);

  const urls = response.rows;

  res.json(urls);
});

type Url = {
  id: number;
  user_id: number;
  url: string;
  create_at: Date;
};

app.use(express.json());
app.post(
  "/users/:userId/urls",
  async (
    req: Request<{ userId: string }, { url: string }>,
    res: Response<Url>
  ) => {
    const { userId } = req.params;
    const { url } = req.body;

    const response = await pool.query<Url>(
      `
        INSERT INTO urls (user_id, url, created_at)
        VALUES
          ($1, $2, $3)
        RETURNING *;
      `,
      [userId, url, new Date()]
    );

    res.json(response.rows[0]);
  }
);

app.patch(
  "/users/:userId/urls/:urlId",
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { urlId } = req.params;
    const { url } = req.body;

    const response = await pool.query<Url>(
      `UPDATE urls SET user_id=$1, url=$2, created_at=$3 WHERE id=$4 RETURNING *;`,
      [userId, url, new Date(), urlId]
      );

    res.json(response.rows[0]);
  }
);

app.delete(
  "/users/:userId/urls/:urlId",
  async (req: Request, res: Response) => {
    const { urlId } = req.params;

    await client.query("BEGIN");

    const response = await client.query(
      `DELETE FROM urls WHERE id=$1 RETURNING id;`,
      [urlId]
    );

    if (response.rows[0].id.toString() === urlId && response.rowCount === 1) {
      await client.query("COMMIT");
      res.json(response.rows[0]);
    } else {
      await client.query("ROLLBACK");
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
