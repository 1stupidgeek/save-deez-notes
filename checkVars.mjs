const vars = ["KEY", "DISCORD_TOKEN"];

const checkVars = () => {
  const missing = vars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
};

export default checkVars;
