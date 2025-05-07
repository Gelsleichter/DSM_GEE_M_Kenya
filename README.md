# Getting Started with Digital Soil Mapping (DSM) in Google Earth Engine (GEE) 
## Soil Organic Carbon (SOC) at Mount Kenya

Welcome! This guide will walk you through how to access and use the Google Earth Engine (GEE) code for the Mount Kenya covariates preparation project. The code is hosted here on GitHub. Let's see how to download it, prepare the files, and run them in GEE. 

---

## What You’ll Need
- A **Google Earth Engine account**. Sign up at [code.earthengine.google.com](https://code.earthengine.google.com/) if you haven’t already.
- A web browser (Chrome or Firefox recommended).
- Unzip tool installed (optional).

---

## Step 1: Setting Up Google Earth Engine

Before running the code, ensure you’re ready to use GEE.

1. **Log in to GEE**:
   - Open [code.earthengine.google.com](https://code.earthengine.google.com/) in your browser.
   - Sign in with your Google account. If you’re new, follow the prompts to register for GEE (it may take a day for approval).
   - How to register:
     - [https://courses.spatialthoughts.com/gee-sign-up.html](https://courses.spatialthoughts.com/gee-sign-up.html) (text)
     - [https://www.youtube.com/watch?v=O9iyjs4w-8I](https://www.youtube.com/watch?v=O9iyjs4w-8I)  (video)

2. **Familiarize Yourself with the GEE Interface**:
   - The GEE Code Editor has a script, docs, and assets panel (left), code editor (center), map area (center-bottom), and a console (right).
   - You’ll paste the code into the script panel and run it to see results on the map or console.

---

## Step 2: Running the Code in GEE

The easiest way is to **copy directly from GitHub and paste into GEE**. Do this for `0_gee_notions.js`, `1_Kenya_covariates_preparation_sfv.js`, and `2_Kenya_DSM_Modeling_sfv.js`.

The second script (`2_Kenya_DSM_Modeling_sfv.js`) requires a data asset that you needs to upload in your account (instructions below).

1. **Open a Code File**:
   - Go to [0_gee_notions code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/0_gee_notions.js), using your keyboard press `Ctrl+A` and `Ctrl+C` to select all and copy, then go to your GEE account, create a script and paste it `Ctrl+V`. (in Mac replace `Ctrl` by `Cmd`.
   - Repeat for [1_Kenya_covariates_preparation_sfv code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/1_Kenya_covariates_preparation_sfv.js) and [2_Kenya_DSM_Modeling_sfv code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/2_Kenya_DSM_Modeling_sfv.js).
   
2. **Paste into GEE**:
   - In the GEE Code Editor, click **New** > **Script** in the script panel (top-left, red button).
   - Paste the copied code (`Ctrl+V` or `Cmd+V`).

3. **Save Your Script**:
   - Click **Save** in GEE, give your script a name (e.g., `Kenya_Covariates`), and save it to your GEE repository. It can be any name, I just suggest using a sequence, e.g., `0, 1, 2`; `a, b, c`, etc.

## As **second option** 
### In case you are new to git hub and more comfortable working locally, you can **download the entire project to your computer, then copy-paste to GEE**. 

The code is stored in a GitHub repository. If you’re new to Git, you can download the files as a ZIP archive.

1. **Visit the GitHub Repository**:
   - Go to the repository link provided by your instructor (e.g., `https://github.com/Gelsleichter/DSM_GEE_M_Kenya`).
   - You’ll see a page with folders and files.

2. **Download the ZIP File**:
   - On the GitHub page, look for a green button labeled **Code** (usually near the top-right).
   - Click it, and select **Download ZIP** from the dropdown menu.
   - A file (e.g., `DSM_GEE_M_Kenya-main.zip`) will download to your computer.

3. **Unzip the File**:
   - Locate the downloaded ZIP file (usually in your `Downloads` folder).
   - **Windows**: Right-click the ZIP file and select **Extract All**. Choose a destination folder and click **Extract**.
   - **Mac**: Double-click the ZIP file, and it will automatically extract to a folder.
   - You’ll now have a folder (e.g., `DSM_GEE_M_Kenya-main`) containing the code files.

4. **Find the Code Files**:
   - Open the extracted folder. You’ll see three main JavaScript files:
     - `0_gee_notions.js`
     - `1_Kenya_covariates_preparation_sfv.js`
     - `2_Kenya_DSM_Modeling_sfv.js`
   - These files contain the GEE scripts you’ll use.
   - Open with Notepad (right-click, open with, choose Notepad), then copy and paste.
  
   **Paste and paste into GEE, as described above**


### Step 3: Uploading the sampling points

The `2_Kenya_DSM_Modeling_sfv.js` script requires a specific data asset `sample_points_mk_soc_0_20cm.csv` that needs to be uploaded in GEE. 

You can find it from [sample_points_mk_soc_0_20cm data](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/sample_points_mk_soc_0_20cm.csv).

1. **How to download it**:
   - In the upper right corner, you will have `Raw`, `two-squares`, and a button to `download`, click on this button, to have the `sample_points_mk_soc_0_20cm.csv`.

2. **Upload Data to GEE**:
   - In the GEE Code Editor, go to the **Assets** tab (left panel).
   - Click **New** > **Table Upload** for `CSV file (.csv)`.
   - **For CSV file (.csv)**:
     - Click the `Select` red button.
     - Choose the file `sample_points_mk_soc_0_20cm.csv` from your computer.
     - In the field "X column" place `x`, and "Y column" place `y`, both small leters.
     - Click **UPLOAD** (no need to rename).
   - Wait for the upload to complete (you’ll see the asset in your Assets list).

3. **Update the Script**:
   - Open `2_Kenya_DSM_Modeling_sfv.js` in a text editor.
   - Find the lines where assets are loaded:
     ```javascript
     var predictors_all = ee.Image("projects/ee-geogelsleichter/assets/DSM_m_kenya_asset_folder/predictors_m_kenya_epsg_4326");
     var points_SOC = ee.FeatureCollection("projects/ee-geogelsleichter/assets/sample_points_mk_soc_0_20cm");
     ```
   - Replace the paths with your own asset paths. For example, if your username is `user123` and you uploaded the assets as `predictors_m_kenya_epsg_4326` and `sample_points_mk_soc_0_20cm`, update to:
     ```javascript
     var predictors_all = ee.Image("users/user123/predictors_m_kenya_epsg_4326");
     var points_SOC = ee.FeatureCollection("users/user123/sample_points_mk_soc_0_20cm");
     ```
   - Save the updated script.

---

### Step 4: Running (we will do it together, but you can explore and try yourself before)

- **Run**: `1_Kenya_covariates_preparation_sfv.js`
- **On Tab Tasks** (upper right) click on `RUN` button to execute the task: `Covariates_Kenya_to_assets` (the `Covariates_Kenya_to_drive` is not necessary, but optional). 
- **Run**: `2_Kenya_DSM_Modeling_sfv.js` (remember to do the adjustments above). This script is mostly commented, and we will reveal it step by step.

**Expected Outputs**:
- A map for the SOC map and points.
- Metrics like RMSE and R² in the console.
- If you see errors, verify your asset paths and ensure the data is uploaded correctly.

---

## Exploring the Results

- **Map Outputs**: The scripts generate layers like elevation (DEM), NDVI, SAVI, and SOC maps. Toggle layers in the GEE map (top-right) to view them.
- **Console Outputs**: Check printed information like band names, resolutions, and model metrics.
- **Exported Files**: The scripts export results to your Google Drive (e.g., `Covariates_Kenya_to_drive.tif`) or GEE Assets. Check your Drive or Assets tab for these files.

---

## Useful Resources

### About GEE

- **GEE Datasets**: Explore available datasets at [developers.google.com/earth-engine/datasets](https://developers.google.com/earth-engine/datasets).
- **Free GEE Course**: Learn more with this [free course](https://courses.spatialthoughts.com/end-to-end-gee.html).

### Papers about DSM

Digital Soil Mapping (DSM) is an exciting field that uses digital tools, geographic information systems (GIS), and machine learning to create fine maps. 
Below is a list of scientific articles and resources on DSM, focusing on foundational concepts, clear explanations, and practical applications. 

- McBratney, A. B., Mendonça Santos, M. L., & Minasny, B. (2003). "On digital soil mapping."
This seminal paper introduces the concept of DSM in a clear, foundational way. It outlines the "scorpan" model (soil, climate, organisms, relief, parent material, age, and spatial position), which is a core framework for DSM. The article traces the history and principles of DSM, making it an excellent starting point for understanding the field.
[DOI](https://doi.org/10.1016/S0016-7061(03)00223-4)

- Minasny, B., & McBratney, A. B. (2016). "Digital soil mapping: A brief history and some lessons."
This article provides a concise history of DSM, highlighting key developments and lessons learned over the years. It’s written in an engaging, narrative style and avoids heavy technical jargon. It also discusses practical challenges and future directions.
Level: Very beginner-friendly, assuming no prior knowledge.
[DOI](https://doi.org/10.1016/j.geoderma.2015.07.017)

- Padarian, J., Minasny, B., & McBratney, A. B. (2019). "Using deep learning for digital soil mapping."
Open-access article introduces how modern machine learning (specifically convolutional neural networks) can be used in DSM. It explains complex concepts like spatial contextual information in a way that’s approachable, with clear examples. It’s great for understanding how technology is shaping DSM today.
[DOI](https://doi.org/10.5194/soil-5-79-2019)

- Arrouays, D., McBratney, A., Bouma, J., Libohova, Z., Richer-de-Forges, A. C., Morgan, C. L. S., et al. (2020). "Impressions of digital soil maps: The good, the not so good, and making them ever better."
This article offers a reflective overview of DSM’s strengths and limitations. It’s written in a conversational tone, discussing real-world applications and challenges in a way that’s easy to follow. It’s perfect for understanding the practical side of DSM.
[DOI](https://doi.org/10.1016/j.geodrs.2020.e00255)

- Grunwald, S. (2011). "Digital Soil Mapping and Modeling at Continental Scales: Finding Solutions for Global Issues."
Introduces DSM in the context of global challenges like food security. It explains how DSM works at large scales and includes clear diagrams and a proposed framework (STEP-AWBH).
[DOI](https://doi.org/10.2136/sssaj2011.0029)

- Wadoux, A. M. J.-C., Minasny, B., & McBratney, A. B. (2020). "Machine learning for digital soil mapping: Applications, challenges and suggested solutions."
An overview of machine learning in DSM, including Random Forest, with clear explanations.
[DOI](https://doi.org/10.1016/j.geoderma.2019.114076)

- Silva, B. P. C., Silva, M. L. N., Avalos, F. A. P., Menezes, M. D. de, & Curi, N. (2019). "Digital soil mapping including additional point sampling in Posses ecosystem services pilot watershed, southeastern Brazil."
This open-access article describes a practical DSM study in Brazil, comparing simple models like Random Forest and logistic regression. It includes a clear methodology and visuals, making it a great case study to see DSM in action.
[DOI](https://doi.org/10.1038/s41598-019-50376-w), [link access](www.nature.com/articles/s41598-019-50376-w)

- Book Chapter: Lagacherie, P., McBratney, A. B., & Voltz, M. (Eds.). (2006). "Digital Soil Mapping: An Introductory Perspective."
This book compiles foundational chapters on DSM, with several introductory sections that explain concepts like soil covariates, GIS, and spatial prediction. 
[DOI](10.1016/S0166-2481(06)31001-2) (for the book)
Access: Available as a book or e-book through Elsevier or academic libraries. Individual chapters may be accessible via ScienceDirect.

- **Book**: Digital Soil Mapping: A practical guide for field soil scientists, Food and Agriculture Organization of the United Nations (FAO), 2020.
This FAO guide is specifically designed for those new to DSM, particularly field soil scientists with minimal technical background. It provides a step-by-step introduction to DSM, explaining concepts like soil covariates, spatial data, and predictive modeling in plain language. The guide includes practical examples, case studies, and visuals, making it ideal for understanding how to apply DSM in real-world settings.
[link access](https://openknowledge.fao.org/server/api/core/bitstreams/5628102c-c895-416b-bbf2-728cadf3bc70/content).


---

## Tips for Success

- **Start with `0_gee_notions.js`**: It’s a simple script to learn GEE basics.
- **Run Scripts One at a Time**: Each script builds on the previous one. Start with `0`, then `1`, then `2`.
- **Check Asset Paths**: For `2_Kenya_DSM_Modeling_sfv.js`, ensure your uploaded assets match the script paths.
- **Save Your Work**: Save scripts in GEE to avoid losing progress.   
- **Be Patient**: GEE processes data in the cloud, so some tasks may take a minute or two.

---

Happy mapping! If you have questions, reach me out. Enjoy exploring Mount Kenya’s environmental data with Google Earth Engine! 🌍







