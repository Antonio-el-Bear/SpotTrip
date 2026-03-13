using System.Diagnostics;
using System.Text;

static string FindWorkspaceRoot(string startDirectory)
{
    var current = new DirectoryInfo(startDirectory);
    while (current is not null)
    {
        var launchScript = Path.Combine(current.FullName, "launch-all.ps1");
        var packageJson = Path.Combine(current.FullName, "package.json");
        if (File.Exists(launchScript) && File.Exists(packageJson))
        {
            return current.FullName;
        }

        current = current.Parent;
    }

    throw new InvalidOperationException("Could not locate the workspace root containing launch-all.ps1 and package.json.");
}

static int RunLauncher(string workspaceRoot)
{
    var launchScript = Path.Combine(workspaceRoot, "launch-all.ps1");
    var processStartInfo = new ProcessStartInfo
    {
        FileName = "powershell.exe",
        Arguments = $"-ExecutionPolicy Bypass -File \"{launchScript}\"",
        WorkingDirectory = workspaceRoot,
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = false,
    };

    using var process = new Process { StartInfo = processStartInfo };
    var outputBuilder = new StringBuilder();

    process.OutputDataReceived += (_, args) =>
    {
        if (!string.IsNullOrWhiteSpace(args.Data))
        {
            outputBuilder.AppendLine(args.Data);
            Console.WriteLine(args.Data);
        }
    };

    process.ErrorDataReceived += (_, args) =>
    {
        if (!string.IsNullOrWhiteSpace(args.Data))
        {
            outputBuilder.AppendLine(args.Data);
            Console.Error.WriteLine(args.Data);
        }
    };

    Console.WriteLine("Starting TravelRecord services...");
    process.Start();
    process.BeginOutputReadLine();
    process.BeginErrorReadLine();
    process.WaitForExit();

    if (process.ExitCode != 0)
    {
        Console.Error.WriteLine();
        Console.Error.WriteLine("Launch failed. Review the output above and history log.md for details.");
        return process.ExitCode;
    }

    var dashboardUrl = "http://localhost:3000/operations";
    Console.WriteLine();
    Console.WriteLine("Opening admin dashboard: " + dashboardUrl);
    Process.Start(new ProcessStartInfo
    {
        FileName = dashboardUrl,
        UseShellExecute = true,
    });

    Console.WriteLine("The app is running. Close this window or use stop-all.ps1 when you want to shut it down.");
    return 0;
}

try
{
    var workspaceRoot = FindWorkspaceRoot(AppContext.BaseDirectory);
    Environment.ExitCode = RunLauncher(workspaceRoot);
}
catch (Exception exception)
{
    Console.Error.WriteLine(exception.Message);
    Environment.ExitCode = 1;
}