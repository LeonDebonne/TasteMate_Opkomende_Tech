#!/bin/bash

cd /home/tastemate/TasteMate_Opkomende_Tech/webserver

source .venv/bin/activate
python server.py &

cd /home/tastemate/TasteMate_Opkomende_Tech/webserver/dist
python3 -m http.server 5173 &

sleep 8

export DISPLAY=:0
export XAUTHORITY=/home/tastemate/.Xauthority

xrandr --output HDMI-1 --rotate right

chromium-browser --start-fullscreen --app=http://localhost:5173 \
--no-first-run \
--disable-infobars \
--disable-translate \
--password-store=basic