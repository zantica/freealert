import { Request, Response } from "express";

export const fearAndGreed = {
  getIndex: async (req: Request, res: Response) => {
    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=1&format=json");
      
      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching Fear and Greed Index:", error);
      res.status(500).json({ 
        error: "Failed to fetch Fear and Greed Index",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  },
};
