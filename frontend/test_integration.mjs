/**
 * Automated Live Integration Test for Assignment 3 React Frontend API Client
 * Tests all requirements against the running Django backend.
 */

const BASE_URL = 'http://127.0.0.1:8000/api';

async function runTests() {
  console.log('🚀 Starting Assignment 3 Frontend-Backend Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch public project list
    console.log('Test 1: Fetch public projects');
    const pubRes = await fetch(`${BASE_URL}/projects/public/`);
    assert(pubRes.status === 200, 'Public project list returns HTTP 200');
    const pubProjects = await pubRes.json();
    assert(Array.isArray(pubProjects) && pubProjects.length >= 4, `Returned ${pubProjects.length} public projects`);

    // 2. Fetch single public project detail
    console.log('\nTest 2: Fetch single public project detail');
    const firstId = pubProjects[0].id;
    const detailRes = await fetch(`${BASE_URL}/projects/public/${firstId}/`);
    assert(detailRes.status === 200, `Public detail for project #${firstId} returns HTTP 200`);
    const projectDetail = await detailRes.json();
    assert(projectDetail.title === pubProjects[0].title, `Title matches: "${projectDetail.title}"`);

    // 3. User Login
    console.log('\nTest 3: Authentication - Login with valid credentials');
    const loginRes = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo_user', password: 'StrongPassword123' }),
    });
    assert(loginRes.status === 200, 'Login returns HTTP 200');
    const loginData = await loginRes.json();
    assert(Boolean(loginData.token), 'Auth token successfully returned');
    assert(loginData.user?.username === 'demo_user', 'Authenticated user is demo_user');
    const token = loginData.token;

    // 4. Invalid Login Rejection
    console.log('\nTest 4: Authentication - Reject invalid credentials');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo_user', password: 'WrongPassword999' }),
    });
    assert(badLoginRes.status === 400, 'Invalid login rejected with HTTP 400');
    const badData = await badLoginRes.json();
    assert(Boolean(badData.error || badData.details), 'Error explanation returned in response body');

    // 5. User Profile
    console.log('\nTest 5: Authentication - Fetch current user profile (/api/auth/me/)');
    const meRes = await fetch(`${BASE_URL}/auth/me/`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    assert(meRes.status === 200, 'GET /api/auth/me/ returns HTTP 200');
    const meData = await meRes.json();
    assert(meData.username === 'demo_user', 'Profile matches authenticated user');

    // 6. User Isolated Project List
    console.log('\nTest 6: Projects - Fetch authenticated user projects');
    const userProjectsRes = await fetch(`${BASE_URL}/projects/`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    assert(userProjectsRes.status === 200, 'GET /api/projects/ returns HTTP 200 with valid Token');
    const userProjects = await userProjectsRes.json();
    assert(Array.isArray(userProjects), 'Returns array of user projects');

    // 7. Project Creation (POST)
    console.log('\nTest 7: CRUD - Create a new portfolio project');
    const testProjectPayload = {
      title: 'Automated E2E Test Project',
      technologies: 'React 18, Vite, Django REST Framework, SQLite',
      description: 'Project created dynamically to verify Assignment 3 full-stack CRUD capabilities.',
      github_url: 'https://github.com/sathwik3404-dev/Portfolio-React-Frontend',
      live_demo_url: 'http://localhost:5173/projects',
    };
    const createRes = await fetch(`${BASE_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProjectPayload),
    });
    assert(createRes.status === 201, 'POST /api/projects/ returns HTTP 201 Created');
    const createdProject = await createRes.json();
    assert(createdProject.title === testProjectPayload.title, 'Created project title matches payload');
    assert(createdProject.owner_username === 'demo_user', 'Project owner assigned to demo_user');
    const createdId = createdProject.id;

    // 8. Full Update (PUT)
    console.log('\nTest 8: CRUD - Full update of created project (PUT)');
    const updatePayload = {
      ...testProjectPayload,
      title: 'Updated E2E Project (PUT)',
      technologies: 'React 18, Vite, DRF, TokenAuth',
    };
    const updateRes = await fetch(`${BASE_URL}/projects/${createdId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    assert(updateRes.status === 200, 'PUT /api/projects/<id>/ returns HTTP 200');
    const updatedProject = await updateRes.json();
    assert(updatedProject.title === 'Updated E2E Project (PUT)', 'Project title updated');

    // 9. Partial Update (PATCH)
    console.log('\nTest 9: CRUD - Partial update of created project (PATCH)');
    const patchRes = await fetch(`${BASE_URL}/projects/${createdId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Patched E2E Project (PATCH)' }),
    });
    assert(patchRes.status === 200, 'PATCH /api/projects/<id>/ returns HTTP 200');
    const patchedProject = await patchRes.json();
    assert(patchedProject.title === 'Patched E2E Project (PATCH)', 'Project title patched');
    assert(patchedProject.technologies === updatePayload.technologies, 'Untouched field preserved');

    // 10. Form Validation - Reject Invalid Creation
    console.log('\nTest 10: Validation - Reject invalid project data (empty title & description)');
    const invalidRes = await fetch(`${BASE_URL}/projects/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: '', description: '', technologies: 'React' }),
    });
    assert(invalidRes.status === 400, 'Backend rejects blank title/description with HTTP 400');
    const invalidData = await invalidRes.json();
    assert(Boolean(invalidData.title), 'Title validation error included in response');
    assert(Boolean(invalidData.description), 'Description validation error included in response');

    // 11. Project Deletion (DELETE)
    console.log('\nTest 11: CRUD - Delete the created project');
    const deleteRes = await fetch(`${BASE_URL}/projects/${createdId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` },
    });
    assert(deleteRes.status === 204, 'DELETE /api/projects/<id>/ returns HTTP 204 No Content');

    // Verify deletion
    const verifyDelRes = await fetch(`${BASE_URL}/projects/${createdId}/`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    assert(verifyDelRes.status === 404, 'Deleted project GET returns HTTP 404 Not Found');

    // 12. User Registration
    console.log('\nTest 12: Authentication - User Registration');
    const randomUser = `student_${Date.now().toString().slice(-6)}`;
    const regPayload = {
      username: randomUser,
      email: `${randomUser}@example.com`,
      password: 'StrongPassword123',
    };
    const regRes = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    assert(regRes.status === 201, 'POST /api/auth/register/ returns HTTP 201 Created');
    const regData = await regRes.json();
    assert(Boolean(regData.token), 'Registration returns active auth token for seamless login');
    assert(regData.user?.username === randomUser, 'Returned user object matches registered username');

    // 13. Unauthenticated access enforcement
    console.log('\nTest 13: Permissions - Enforce 401 on protected endpoint without token');
    const noAuthRes = await fetch(`${BASE_URL}/projects/`);
    assert(noAuthRes.status === 401, 'Unauthenticated GET /api/projects/ returns HTTP 401 Unauthorized');

  } catch (error) {
    console.error('Fatal error during integration tests:', error);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Integration Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
