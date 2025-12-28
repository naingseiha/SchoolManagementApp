#!/usr/bin/env python3
import requests
import json

# Login
login_res = requests.post('http://localhost:5001/api/auth/login', json={
    'email': 'admin@school.edu.kh',
    'password': 'admin123'
})
token = login_res.json()['data']['token']
headers = {'Authorization': f'Bearer {token}'}

# Get Results screen data
results_res = requests.get(
    'http://localhost:5001/api/reports/monthly/cmiq805mh0015q0jal0pu36yp?month=ធ្នូ&year=2025',
    headers=headers
)
results = results_res.json()['data']

print('\n=== RESULTS SCREEN (Class 11ក) ===')
print(f'Class Name: {results["className"]}')
print(f'Total Students: {len(results["students"])}')
print(f'Total Coefficient: {results["totalCoefficient"]}')

# Count grades
grade_dist = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0}
total_avg = 0
pass_count = 0

for s in results['students']:
    grade_dist[s['gradeLevel']] += 1
    total_avg += float(s['average'])
    if s['gradeLevel'] != 'F':
        pass_count += 1

print('\nGrade Distribution:')
for grade in ['A', 'B', 'C', 'D', 'E', 'F']:
    print(f'  {grade}: {grade_dist[grade]}')

print(f'\nClass Average: {total_avg / len(results["students"]):.2f}')
print(f'Pass Count: {pass_count}')
print(f'Pass Rate: {(pass_count / len(results["students"]) * 100):.1f}%')

# Get Statistics screen data
stats_res = requests.get(
    'http://localhost:5001/api/dashboard/comprehensive-stats',
    headers=headers
)
stats = stats_res.json()['data']
grade11 = next(g for g in stats['grades'] if g['grade'] == '11')
class11k = next(c for c in grade11['classes'] if c['name'] == 'ថ្នាក់ទី11ក')

print('\n\n=== STATISTICS SCREEN (Class 11ក) ===')
print(f'Class Name: {class11k["name"]}')
print(f'Student Count: {class11k["studentCount"]}')

print('\nGrade Distribution:')
for grade in ['A', 'B', 'C', 'D', 'E', 'F']:
    print(f'  {grade}: {class11k["gradeDistribution"][grade]["total"]}')

print(f'\nClass Average: {class11k["averageScore"]}')
print(f'Pass Count: {class11k["passedCount"]}')
print(f'Pass Rate: {class11k["passPercentage"]}%')

# Compare
print('\n\n=== COMPARISON ===')
for grade in ['A', 'B', 'C', 'D', 'E', 'F']:
    results_count = grade_dist[grade]
    stats_count = class11k['gradeDistribution'][grade]['total']
    match = '✅' if results_count == stats_count else '❌'
    print(f'Grade {grade} - Results: {results_count} | Statistics: {stats_count} | {match}')

results_pass = pass_count
stats_pass = class11k['passedCount']
match = '✅' if results_pass == stats_pass else '❌'
print(f'Pass Count - Results: {results_pass} | Statistics: {stats_pass} | {match}')
