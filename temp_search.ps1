$content = Get-Content 'C:\Users\DuyMT\.claude\projects\D--WORKSPACE-RESEARCH-recruitAI-web\fed1ea9d-29bc-43e2-b450-1bbdbcf9302b\tool-results\mcp-stitch-list_screens-1778684040954.txt' -Raw
$data = $content | ConvertFrom-Json
$newScreens = $data.screens | Where-Object { $_.title -match 'Content Gen|Request|A1' } | ForEach-Object {
    "$($_.name) | $($_.title)"
}
if ($newScreens) {
    $newScreens
} else {
    Write-Output "No new screens found"
}