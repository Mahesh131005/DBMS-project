#!/bin/bash
git checkout $1 -- data.db && echo "✅ Checked out: $1" || echo "❌ Failed"
