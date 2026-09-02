import React, { useState } from "react";
import { 
  Box, 
  Grid, 
  Typography, 
  Button, 
  Checkbox, 
  FormControlLabel,
  Container,
  Chip,
  Card,
  CardContent,
  useMediaQuery,
  Divider,
  Paper,
  IconButton
} from "@mui/material";
import { 
  WorkOutline, 
  LocationOnOutlined, 
  FilterAltOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search,
  TrendingUp,
  Diversity3,
  Balance,
  LocalOffer
} from "@mui/icons-material";
import JobBG from "../assets/jobbg.jpg"
import TopNavbar from "../../footernavbar/TopNavbar";
import { useRouter } from 'next/router';
import Job from "../job"


// Sample job openings data
const jobOpenings = [
  {
    id: 1,
    title: "Software Engineer",
    subheading: "Full-time",
    location: "Bangalore",
    department: "Engineering",
    description: "Develop and maintain web applications using React and Node.js.",
  },
  {
    id: 2,
    title: "Product Manager",
    subheading: "Full-time",
    location: "Mumbai",
    department: "Product",
    description: "Lead product development teams and manage product lifecycle.",
  },
  {
    id: 3,
    title: "UX Designer",
    subheading: "Contract",
    location: "Delhi",
    department: "Design",
    description: "Design user interfaces and improve user experience.",
  },
  {
    id: 4,
    title: "QA Engineer",
    subheading: "Full-time",
    location: "Hyderabad",
    department: "Quality Assurance",
    description: "Test and ensure the quality of software products.",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    subheading: "Full-time",
    location: "Pune",
    department: "Infrastructure",
    description: "Manage infrastructure and deployment pipelines.",
  },
  {
    id: 6,
    title: "Data Analyst",
    subheading: "Part-time",
    location: "Chennai",
    department: "Data Science",
    description: "Analyze data and generate business insights.",
  },
];

const filterOptions = [
  { label: "Full-time", value: "fulltime" },
  { label: "Part-time", value: "parttime" },
  { label: "Contract", value: "contract" },
];

const departmentOptions = [
  { label: "Engineering", value: "engineering" },
  { label: "Product", value: "product" },
  { label: "Design", value: "design" },
  { label: "Quality Assurance", value: "qa" },
  { label: "Infrastructure", value: "infrastructure" },
  { label: "Data Science", value: "data" },
];

const locationOptions = [
  { label: "Bangalore", value: "bangalore" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Delhi", value: "delhi" },
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Pune", value: "pune" },
  { label: "Chennai", value: "chennai" },
];

const Careers = () => {
  const [typeFilters, setTypeFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [departmentFilters, setDepartmentFilters] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
    const router = useRouter();

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const handleTypeFilterChange = (event) => {
    const { value, checked } = event.target;
    setTypeFilters((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const handleLocationFilterChange = (event) => {
    const { value, checked } = event.target;
    setLocationFilters((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const handleDepartmentFilterChange = (event) => {
    const { value, checked } = event.target;
    setDepartmentFilters((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const filteredJobs = jobOpenings.filter((job) => {
    // Type filter
    const typeMatch = typeFilters.length === 0 || 
      typeFilters.includes(
        job.subheading.toLowerCase().replace("-", "").replace(" ", "")
      );
    
    // Location filter
    const locationMatch = locationFilters.length === 0 ||
      locationFilters.includes(
        job.location.toLowerCase()
      );
    
    // Department filter
    const departmentMatch = departmentFilters.length === 0 ||
      departmentFilters.includes(
        job.department.toLowerCase().replace(" ", "")
      );
    
    return typeMatch && locationMatch && departmentMatch;
  });

  return (
    <>
      <TopNavbar />
      <Box sx={{ bgcolor: "#f8f8f8", minHeight: "150vh" }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: "#FF9900",
            color: "white",
            py: { xs: 2, md: 3 },
            }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography   
                  variant="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '2rem', md: '3rem' }
                  }}
                >
                  Join Our Team
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 400,
                    mb: 3,
                    opacity: 0.9
                  }}
                >
                  Build your career with us and help create amazing products that make a difference
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    bgcolor: "rgb(36, 138, 30)", 
                    px: 4, 
                    py: 1.5,
                    '&:hover': {
                      bgcolor: "#E06500",
                    },
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 1
                  }}
                >
                  Explore Opportunities
                </Button>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box 
                  component="img"
                  src={JobBG.src}
                  alt="Careers"
                  sx={{ 
                    width: "100%", 
                    height: "300px",
                    borderRadius: 2,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    objectFit: "cover"
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
 {/* Company Values Section */}
 <Box sx={{ my: 8, py: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            textAlign="center" 
            color="#8a1e1e"
            gutterBottom
          >
            Why Join Us?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ maxWidth: 700, mx: "auto", mb: 5 }}
          >
            We&apos;re building a team of passionate individuals who want to make an impact and grow their careers.
          </Typography>
          
          <Grid container spacing={4} mt={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center", p: 2 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: "50%", 
                      bgcolor: "rgba(255,126,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 40, color: "#FF7E00" }} />
                  </Box>
                  <Typography variant="h6" color="#8a1e1e" fontWeight={600} gutterBottom>
                    Growth Opportunities
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We invest in your development and provide clear paths for career advancement.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: "50%", 
                      bgcolor: "rgba(255,126,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <Diversity3 sx={{ fontSize: 40, color: "#FF7E00" }} />
                  </Box>
                  <Typography variant="h6" color="#8a1e1e" fontWeight={600} gutterBottom>
                    Inclusive Culture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We foster a supportive environment where everyone belongs and can thrive.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: "50%", 
                      bgcolor: "rgba(255,126,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <Balance sx={{ fontSize: 40, color: "#FF7E00" }} />
                  </Box>
                  <Typography variant="h6" color="#8a1e1e" fontWeight={600} gutterBottom>
                    Work-Life Balance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We value your time and promote healthy boundaries between work and personal life.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <Box 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: "50%", 
                      bgcolor: "rgba(255,126,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2
                    }}
                  >
                    <LocalOffer sx={{ fontSize: 40, color: "#FF7E00" }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="#8a1e1e" gutterBottom>
                    Competitive Benefits
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We offer comprehensive benefits that support your financial, physical, and mental wellbeing.
                  </Typography>
                </Box>
              </Grid>
          </Grid>
        </Box>
      {/* Job Search Section */}
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            p: 2, 
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <Typography variant="h5" color="#8a1e1e" fontWeight={600}>
            {filteredJobs.length} Open Positions
          </Typography>
          
          {isMobile && (
            <Button 
              variant="outlined"
              startIcon={<FilterAltOutlined />}
              endIcon={showMobileFilters ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              onClick={toggleMobileFilters}
              sx={{ 
                borderColor: "#FF7E00",
                color: "#FF7E00",
                '&:hover': {
                  borderColor: "#E06500",
                  bgcolor: "rgba(255,126,0,0.04)"
                }
              }}
            >
              Filters
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Filter Section */}
          <Grid 
            item 
            xs={12} 
            md={3}
            sx={{ 
              display: isMobile ? (showMobileFilters ? 'block' : 'none') : 'block'
            }}
          >
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                mb: 3,
                border: "1px solid #eaeaea"
              }}
            >
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                gutterBottom
                sx={{ 
                  pb: 1,
                  borderBottom: "1px solid #eaeaea",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <FilterAltOutlined fontSize="small" />
                Filter Jobs
              </Typography>

              {/* Job Type Filters */}
              <Box sx={{ mb: 3, mt: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600}
                  color="text.secondary" 
                  gutterBottom
                >
                  Job Type
                </Typography>
                {filterOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        value={option.value}
                        checked={typeFilters.includes(option.value)}
                        onChange={handleTypeFilterChange}
                        sx={{
                          color: "#C4C4C4",
                          '&.Mui-checked': {
                            color: "#FF7E00",
                          },
                        }}
                        size="small"
                      />
                    }
                    label={option.label}
                    sx={{ display: "block", mb: 0.5 }}
                  />
                ))}
              </Box>

              {/* Location Filters */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600}
                  color="text.secondary" 
                  gutterBottom
                >
                  Location
                </Typography>
                {locationOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        value={option.value}
                        checked={locationFilters.includes(option.value)}
                        onChange={handleLocationFilterChange}
                        sx={{
                          color: "#C4C4C4",
                          '&.Mui-checked': {
                            color: "#FF7E00",
                          },
                        }}
                        size="small"
                      />
                    }
                    label={option.label}
                    sx={{ display: "block", mb: 0.5 }}
                  />
                ))}
              </Box>

              {/* Department Filters */}
              <Box sx={{ mb: 1 }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600}
                  color="text.secondary" 
                  gutterBottom
                >
                  Department
                </Typography>
                {departmentOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        value={option.value}
                        checked={departmentFilters.includes(option.value)}
                        onChange={handleDepartmentFilterChange}
                        sx={{
                          color: "#C4C4C4",
                          '&.Mui-checked': {
                            color: "#FF7E00",
                          },
                        }}
                        size="small"
                      />
                    }
                    label={option.label}
                    sx={{ display: "block", mb: 0.5 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Job Cards Section */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <Grid item xs={12} sm={6} lg={4} key={job.id}>
                    <Card 
                      elevation={0}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        border: "1px solid #eaeaea",
                        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {job.title}
                        </Typography>
                        
                        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                          <Chip
                            icon={<WorkOutline fontSize="small" />}
                            label={job.subheading}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,126,0,0.1)",
                              color: "#FF7E00",
                              fontWeight: 500,
                              border: "none"
                            }}
                          />
                          <Chip
                            icon={<LocationOnOutlined fontSize="small" />}
                            label={job.location}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: "#ddd",
                              color: "#666"
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          gutterBottom
                          sx={{ fontWeight: 500 }}
                        >
                          {job.department}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 1, mb: 3, flex: 1 }}
                        >
                          {job.description}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          onClick={() => router.push('/job')}

                          fullWidth
                          sx={{
                            bgcolor: "#FF7E00",
                            '&:hover': {
                              bgcolor: "#E06500",
                            },
                            textTransform: "none",
                            fontWeight: 600,
                            py: 1.2,
                            mt: "auto"
                          }}
                        >
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>   
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 5, 
                      textAlign: "center",
                      bgcolor: "white",
                      borderRadius: 2,
                      border: "1px solid #eaeaea"
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No matching jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try adjusting your filters to see more results
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
        
       
      </Container>
    </Box>
    </>
  );
};

export default Careers;