@echo off

cls

set ffmpeg_name="ffmpeg-n5.0.1-8-g54e0971edb-win64-lgpl-5.0"
set ffmpeg_sidecar_name="ffmpeg-x86_64-pc-windows-msvc"

echo "# Downloading FFmpeg..."
powershell.exe -command "& wget https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2022-07-20-12-42/%ffmpeg_name%.zip -O %ffmpeg_name%.zip"
echo "# FFmpeg downloaded successfully!"

echo "# Decompressing FFmpeg..."
tar -xf "%ffmpeg_name%.zip"
echo "# FFmpeg decompressed successfully!"

rename "%ffmpeg_name%\bin\ffmpeg.exe" "%ffmpeg_sidecar_name%.exe"
echo "# FFmpeg renamed!"

move "%ffmpeg_name%\bin\%ffmpeg_sidecar_name%.exe" ..\bin\
echo "# FFmpeg copied!"

:: Lets clear the temporary files
rd "%ffmpeg_name%" /s /q
del "%ffmpeg_name%.zip"