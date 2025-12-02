$url = "https://script.google.com/macros/s/AKfycbwx6hqU0lFMkhFYkjcvC1Klbq437gFKsHVxhqgDHNAdhh4SUD76aVIsVLIn6rKpJt43/exec"

$body = @{
    fullName = "Test User"
    email = "test@example.com"
    phone = "1234567890"
    message = "This is a test message from PowerShell"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
