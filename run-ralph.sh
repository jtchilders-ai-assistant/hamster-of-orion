#!/bin/bash
cd ~/projects/orion-game
echo "=== Ralph Loop Started: $(date) ===" >> .agents/session.log
ralph-loop . 50 2>&1 | tee -a .agents/session.log
echo "=== Ralph Loop Finished: $(date) ===" >> .agents/session.log
