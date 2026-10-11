Add-Type @'
using System;
using System.Threading;
using System.Diagnostics;
using System.Runtime.InteropServices;

public class UserDesktopOpener {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern IntPtr OpenDesktop(string lpszDesktop, int dwFlags, bool fInherit, uint dwDesiredAccess);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SetThreadDesktop(IntPtr hDesktop);

    public static void OpenUrl(string url) {
        Thread t = new Thread(() => {
            IntPtr hDesk = OpenDesktop("Default", 0, false, 0x01FF);
            SetThreadDesktop(hDesk);

            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";

            // Try Chrome first
            if (System.IO.File.Exists(chromePath)) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = chromePath;
                    psi.Arguments = url + " --window-position=960,0 --window-size=960,1040";
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                    Console.WriteLine("Launched Chrome on user desktop: " + url);
                    return;
                } catch (Exception ex) {
                    Console.WriteLine("Chrome launch error: " + ex.Message);
                }
            }

            // Fallback to Edge
            if (System.IO.File.Exists(edgePath)) {
                try {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = edgePath;
                    psi.Arguments = url + " --window-position=960,0 --window-size=960,1040";
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                    Console.WriteLine("Launched Edge on user desktop: " + url);
                    return;
                } catch (Exception ex) {
                    Console.WriteLine("Edge launch error: " + ex.Message);
                }
            }
        });
        t.Start();
        t.Join();
    }
}
'@

[UserDesktopOpener]::OpenUrl("http://localhost:3000")
