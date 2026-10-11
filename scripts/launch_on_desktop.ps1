param(
    [string]$ExePath = "C:\Program Files\Google\Chrome\Application\chrome.exe",
    [string]$Args = "--user-data-dir=C:\Users\pande\AppData\Local\Temp\chrome_dairy_profile --window-position=960,0 --window-size=960,1040 --no-first-run --no-default-browser-check http://localhost:3000"
)

Add-Type @'
using System;
using System.Runtime.InteropServices;

public class ProcessLauncher {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    public struct STARTUPINFO {
        public int cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public int dwX;
        public int dwY;
        public int dwXSize;
        public int dwYSize;
        public int dwCountCharsX;
        public int dwCountCharsY;
        public int dwFillAttribute;
        public int dwFlags;
        public short wShowWindow;
        public short cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_INFORMATION {
        public IntPtr hProcess;
        public IntPtr hThread;
        public int dwProcessId;
        public int dwThreadId;
    }

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern bool CreateProcess(
        string lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation
    );

    public static int LaunchOnDefaultDesktop(string exePath, string args) {
        STARTUPINFO si = new STARTUPINFO();
        si.cb = Marshal.SizeOf(si);
        si.lpDesktop = @"WinSta0\Default";
        PROCESS_INFORMATION pi;

        string cmd = "\"" + exePath + "\" " + args;
        bool success = CreateProcess(null, cmd, IntPtr.Zero, IntPtr.Zero, false, 0, IntPtr.Zero, null, ref si, out pi);
        if (success) {
            Console.WriteLine("Spawned PID: " + pi.dwProcessId + " onto WinSta0\\Default!");
            return pi.dwProcessId;
        } else {
            int err = Marshal.GetLastWin32Error();
            Console.WriteLine("CreateProcess failed with error: " + err);
            return -1;
        }
    }
}
'@

$pid = [ProcessLauncher]::LaunchOnDefaultDesktop($ExePath, $Args)
Start-Sleep -Seconds 2
Get-Process -Id $pid -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, MainWindowTitle, SessionId
