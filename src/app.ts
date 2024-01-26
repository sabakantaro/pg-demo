import express, { Request, Response } from "express";
import { QueryConfig } from "pg";
import { client, pool } from "./db";

export const app = express();

type Project = {
  id: number;
  name: string;
  description: string;
};

app.get("/projects", async (req: Request, res: Response) => {
  const response = await pool.query<Project>(`SELECT * from projects;`);

  const projects = response.rows;

  res.json(projects);
});

app.get(
  "/projects/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;

    const query: QueryConfig = {
      text: `SELECT * from projects WHERE id = $1;`,
      values: [id]
    };

    const response = await pool.query<Project>(query);

    const projects = response.rows;

    res.json(projects[0]);
  }
);

app.post("/projects", (req: Request, res: Response) => {});
app.patch("/projects/:id", (req: Request, res: Response) => {});
app.delete("/projects/:id", (req: Request, res: Response) => {});
app.get("/tasks", (req: Request, res: Response) => {});

type Task = {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  is_completed: boolean;
  create_at: Date;
};

type RequestBodyProps = Pick<
  Task,
  "name" | "description" | "start_date" | "end_date"
>;

app.use(express.json());
app.post(
  "/projects/:projectId/tasks",
  async (
    req: Request<{ projectId: string }, {}, RequestBodyProps>,
    res: Response<Task>
  ) => {
    // name, description, start_date, end_date

    const { projectId } = req.params;
    const { description, end_date, name, start_date } = req.body;

    const response = await pool.query<Task>(
      `
        INSERT INTO tasks (project_id, name, description, start_date, end_date)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING *;
      `,
      [projectId, name, description, start_date, end_date]
    );

    res.json(response.rows[0]);
  }
);
app.patch(
  "/projects/:projectId/tasks/:taskId",
  async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { description, end_date, name, start_date } = req.body;

    const response = await pool.query<Task>(
      `UPDATE tasks SET name=$1, description=$2, start_date=$3, end_date=$4 WHERE id=$5 RETURNING *;`,
      [name, description, start_date, end_date, taskId]
    );

    res.json(response.rows[0]);
  }
);
app.delete(
  "/projects/:projectId/tasks/:taskId",
  async (req: Request, res: Response) => {
    const { taskId } = req.params;

    await client.query("BEGIN");

    const response = await client.query(
      `DELETE FROM tasks WHERE id=$1 RETURNING id;`,
      [taskId]
    );

    if (response.rows[0].id.toString() === taskId && response.rowCount === 1) {
      await client.query("COMMIT");
      res.json(response.rows[0]);
    } else {
      await client.query("ROLLBACK");
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);
