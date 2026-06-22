# Project Overview

## Context

**zats-greenscore** is a hybrid web/desktop application for evaluating the eco-design score of digital projects, in particular APIs.

This project is inspired by the [API Green Score](https://github.com/API-Green-Score/APIGreenScore) initiative and implements their evaluation questionnaire as an interactive web interface.

## Problem Solved

The original API Green Score questionnaire is provided as an Excel file, which limits:
- Accessibility for non-technical users
- Engagement and user experience
- The ability to track multiple projects over time
- Team collaboration

## Solution

A modern, lightweight web application that:
1. Transforms the static questionnaire into a dynamic interface
2. Calculates the score in real time
3. Allows managing multiple projects
4. Remains eco-designed itself (consistent with the project's philosophy)

## Goals

### Short term
- [x] Interactive questionnaire interface
- [x] Real-time score calculation
- [x] Management of multiple projects (local storage)
- [x] Desktop application with Tauri
- [ ] PDF export of results

### Long term
- [ ] Multi-language support
- [ ] Team collaboration
- [ ] Alternative storage backend (cloud)
- [ ] Customizable questionnaires
- [ ] Analytics and improvement tracking

## Target Audience

- **API developers** wishing to evaluate the environmental impact of their APIs
- **Architects** seeking to apply eco-design best practices
- **DevOps/SRE teams** responsible for the infrastructure
- **Product Owners** aware of the environmental impact of digital technology

## Guiding Principles

1. **Lead by example** - The application must itself be eco-designed
2. **Simplicity** - Clear and intuitive interface
3. **Lightweight** - Minimal footprint (no heavy JS framework)
4. **Offline-first** - Works without an internet connection
5. **Open source** - Community contribution encouraged
