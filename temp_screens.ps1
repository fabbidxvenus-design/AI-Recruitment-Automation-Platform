$content = Get-Content 'C:\Users\DuyMT\.claude\projects\D--WORKSPACE-RESEARCH-recruitAI-web\fed1ea9d-29bc-43e2-b450-1bbdbcf9302b\tool-results\mcp-stitch-list_screens-1778683854340.txt' -Raw
$data = $content | ConvertFrom-Json
foreach ($screen in $data.screens) {
    Write-Output "$($screen.screenId) | $($screen.title)"
}