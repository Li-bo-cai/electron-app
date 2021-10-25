@echo off

set filePath = %~dp0
echo %filePath% @echo off cd %filePath%
%~d0

cd %filePath%
start oa.exe