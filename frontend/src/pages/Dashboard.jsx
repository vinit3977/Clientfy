import "../styles/Dashboard.css";

const Dashboard = () => {
  const tasks = [
    {
      title: "Send project proposal",
      client: "Royal Studios",
      date: "Today",
      priority: "High",
    },
    {
      title: "Review website design",
      client: "Nova Technologies",
      date: "Tomorrow",
      priority: "Medium",
    },
    {
      title: "Prepare invoice",
      client: "Urban Solutions",
      date: "Oct 5",
      priority: "High",
    },
    {
      title: "Client feedback meeting",
      client: "Apex Creative",
      date: "Oct 7",
      priority: "Low",
    },
  ];

  const stats = [
    {
      title: "Total Clients",
      value: "128",
      change: "+12% this month",
      icon: "♙",
      color: "beige",
    },
    {
      title: "Active Projects",
      value: "24",
      change: "+8% this month",
      icon: "▣",
      color: "blue",
    },
    {
      title: "Revenue",
      value: "$48,250",
      change: "+18% this month",
      icon: "$",
      color: "wine",
    },
    {
      title: "Pending Payments",
      value: "$12,480",
      change: "8 invoices",
      icon: "₹",
      color: "slate",
    },
  ];

  const projects = [
    {
      name: "Royal Website Redesign",
      client: "Royal Studios",
      progress: 78,
      status: "In Progress",
    },
    {
      name: "Marketing Campaign",
      client: "Nova Technologies",
      progress: 52,
      status: "In Progress",
    },
    {
      name: "Mobile App Development",
      client: "Urban Solutions",
      progress: 35,
      status: "In Progress",
    },
    {
      name: "Brand Identity Design",
      client: "Apex Creative",
      progress: 100,
      status: "Completed",
    },
  ];

  const activities = [
    {
      title: "New client added",
      description: "Sarah Williams was added to your clients.",
      time: "10 minutes ago",
    },
    {
      title: "Project updated",
      description: "Royal Website Redesign moved to 78%.",
      time: "1 hour ago",
    },
    {
      title: "Payment received",
      description: "Invoice INV-2026-024 was paid.",
      time: "3 hours ago",
    },
    {
      title: "Task completed",
      description: "Homepage UI Design was completed.",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>

          <h1>Good morning, Priya 👋</h1>

          <p className="dashboard-subtitle">
            Here's everything that needs your attention today.
          </p>
        </div>

        <button className="add-client-btn">
          <span>+</span>
          Add New
        </button>

      </div>


      {/* ================= TOP PRIORITY AREA ================= */}

      <div className="top-dashboard-grid">

        {/* UPCOMING TASKS */}

        <div className="dashboard-card upcoming-card">

          <div className="card-header">

            <div>
              <h3>Upcoming Tasks</h3>
              <p>Your tasks that need attention</p>
            </div>

            <button className="view-all">
              View All →
            </button>

          </div>


          <div className="task-list">

            {tasks.map((task, index) => (

              <div className="task-row" key={index}>

                <div
                  className={`task-dot ${
                    task.priority === "High" ? "urgent" : ""
                  }`}
                >
                  <span></span>
                </div>

                <div className="task-content">

                  <h4>{task.title}</h4>

                  <p>{task.client}</p>

                </div>

                <div className="task-right">

                  <span
                    className={`priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                  <span className="task-date">
                    {task.date}
                  </span>

                </div>

              </div>

            ))}

          </div>


          <div className="task-footer">

            <span>
              <strong>2</strong> overdue
            </span>

            <span>
              <strong>5</strong> due this week
            </span>

            <span>
              <strong>12</strong> completed
            </span>

          </div>

        </div>


        {/* ================= TODAY AT A GLANCE ================= */}

        <div className="dashboard-card glance-card">

          <div className="card-header">

            <div>
              <h3>Today at a Glance</h3>
              <p>Your important updates for today</p>
            </div>

          </div>


          <div className="glance-list">

            {/* APPOINTMENT */}

            <div className="glance-item">

              <div className="glance-icon beige-icon">
                📅
              </div>

              <div className="glance-content">

                <span className="glance-label">
                  NEXT APPOINTMENT
                </span>

                <strong>
                  Client Strategy Call
                </strong>

                <p>
                  Today · 3:30 PM
                </p>

              </div>

              <span className="glance-arrow">
                →
              </span>

            </div>


            {/* TODAY TASKS */}

            <div className="glance-item">

              <div className="glance-icon wine-icon">
                !
              </div>

              <div className="glance-content">

                <span className="glance-label">
                  DUE TODAY
                </span>

                <strong>
                  2 tasks
                </strong>

                <p>
                  One high priority
                </p>

              </div>

              <span className="glance-arrow">
                →
              </span>

            </div>


            {/* PAYMENT */}

            <div className="glance-item">

              <div className="glance-icon blue-icon">
                $
              </div>

              <div className="glance-content">

                <span className="glance-label">
                  PAYMENT
                </span>

                <strong>
                  $3,250 awaiting
                </strong>

                <p>
                  Invoice #INV-024
                </p>

              </div>

              <span className="glance-arrow">
                →
              </span>

            </div>


            {/* PROJECT DEADLINE */}

            <div className="glance-item">

              <div className="glance-icon slate-icon">
                ✓
              </div>

              <div className="glance-content">

                <span className="glance-label">
                  NEXT DEADLINE
                </span>

                <strong>
                  Royal Website Redesign
                </strong>

                <p>
                  Due in 4 days
                </p>

              </div>

              <span className="glance-arrow">
                →
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ================= BUSINESS OVERVIEW ================= */}

      <div className="section-title">

        <div>
          <h2>Business Overview</h2>

          <p>
            Your business performance at a glance
          </p>
        </div>

      </div>


      {/* KPI CARDS */}

      <div className="kpi-grid">

        {stats.map((stat, index) => (

          <div className="kpi-card" key={index}>

            <div className="kpi-top">

              <span>
                {stat.title}
              </span>

              <div
                className={`kpi-icon ${stat.color}`}
              >
                {stat.icon}
              </div>

            </div>


            <strong>
              {stat.value}
            </strong>


            <small
              className={
                stat.title === "Pending Payments"
                  ? "neutral"
                  : "positive"
              }
            >
              {stat.title !== "Pending Payments" && "↑ "}
              {stat.change}
            </small>

          </div>

        ))}

      </div>


      {/* ================= ANALYTICS ================= */}

      <div className="analytics-grid">

        {/* REVENUE */}

        <div className="dashboard-card revenue-card">

          <div className="card-header">

            <div>
              <h3>Revenue Overview</h3>

              <p>
                Monthly revenue performance
              </p>
            </div>

            <select>
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
              <option>This Year</option>
            </select>

          </div>


          <div className="revenue-number">

            <strong>$48,250</strong>

            <span>
              ↑ 18.4%
            </span>

          </div>


          <div className="bar-chart">

            <div className="bar-column">
              <div className="bar" style={{ height: "42%" }} />
              <span>May</span>
            </div>

            <div className="bar-column">
              <div className="bar" style={{ height: "58%" }} />
              <span>Jun</span>
            </div>

            <div className="bar-column">
              <div className="bar" style={{ height: "48%" }} />
              <span>Jul</span>
            </div>

            <div className="bar-column">
              <div className="bar" style={{ height: "70%" }} />
              <span>Aug</span>
            </div>

            <div className="bar-column">
              <div className="bar" style={{ height: "63%" }} />
              <span>Sep</span>
            </div>

            <div className="bar-column">
              <div
                className="bar current"
                style={{ height: "88%" }}
              />
              <span>Oct</span>
            </div>

          </div>

        </div>


        {/* PROJECT STATUS */}

        <div className="dashboard-card project-status-card">

          <div className="card-header">

            <div>
              <h3>Project Status</h3>

              <p>
                Current project distribution
              </p>
            </div>

            <button className="view-all">
              View All →
            </button>

          </div>


          <div className="project-status-content">

            <div className="donut-chart">

              <div className="donut-center">

                <strong>24</strong>

                <span>
                  Projects
                </span>

              </div>

            </div>


            <div className="status-list">

              <div className="status-item">

                <div>
                  <span className="status-dot wine-dot"></span>
                  In Progress
                </div>

                <strong>12</strong>

              </div>


              <div className="status-item">

                <div>
                  <span className="status-dot blue-dot"></span>
                  Completed
                </div>

                <strong>8</strong>

              </div>


              <div className="status-item">

                <div>
                  <span className="status-dot beige-dot"></span>
                  Pending
                </div>

                <strong>4</strong>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================= BOTTOM ================= */}

      <div className="bottom-grid">

        {/* RECENT PROJECTS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Recent Projects</h3>

              <p>
                Your latest project activity
              </p>
            </div>

            <button className="view-all">
              View All →
            </button>

          </div>


          <div className="projects-list">

            {projects.map((project, index) => (

              <div
                className="project-row"
                key={index}
              >

                <div className="project-main">

                  <div className="project-avatar">
                    {project.name.charAt(0)}
                  </div>

                  <div>

                    <h4>
                      {project.name}
                    </h4>

                    <p>
                      {project.client}
                    </p>

                  </div>

                </div>


                <div className="project-progress">

                  <div className="progress-top">

                    <span>
                      {project.status}
                    </span>

                    <strong>
                      {project.progress}%
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${project.progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Recent Activity</h3>

              <p>
                Latest updates across Clientify
              </p>
            </div>

            <button className="view-all">
              View All →
            </button>

          </div>


          <div className="activity-list">

            {activities.map((activity, index) => (

              <div
                className="activity-row"
                key={index}
              >

                <div className="activity-icon">
                  ✓
                </div>

                <div className="activity-content">

                  <p>
                    <strong>
                      {activity.title}
                    </strong>
                  </p>

                  <span>
                    {activity.description}
                  </span>

                  <small>
                    {activity.time}
                  </small>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;