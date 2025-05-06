# Getting Started with Google Earth Engine (GEE) Code for Mount Kenya Covariates

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
     - [code.earthengine.google.com](https://courses.spatialthoughts.com/gee-sign-up.html) (text)
     - [https://www.youtube.com/watch?v=O9iyjs4w-8I](https://www.youtube.com/watch?v=O9iyjs4w-8I)  (video)

2. **Familiarize Yourself with the GEE Interface**:
   - The GEE Code Editor has a script panel (left), a map area (center), and a console (right).
   - You’ll paste the code into the script panel and run it to see results on the map or console.

---

## Step 2: Running the Code in GEE

The easiest way is to **copy directly from GitHub and paste into GEE**. Do this for `0_gee_notions.js`, `1_Kenya_covariates_preparation_sfv.js`, and `2_Kenya_DSM_Modeling_sfv.js`.

The second script (`2_Kenya_DSM_Modeling_sfv.js`) requires specific data assets, so you’ll need to upload it (instructions below).

1. **Open a Code File**:
   - Go to [0_gee_notions code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/0_gee_notions.js), using your keyboard press `Ctrl+A` and `Ctrl+C` to select all and copy, then go to your GEE account, create a script and paste it `Ctrl+V`. (in Mac replace `Ctrl` by `Cmd`.
   - Repeat for [1_Kenya_covariates_preparation_sfv code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/1_Kenya_covariates_preparation_sfv.js) and [2_Kenya_DSM_Modeling_sfv code](https://github.com/Gelsleichter/DSM_GEE_M_Kenya/blob/main/2_Kenya_DSM_Modeling_sfv.js).
   
2. **Paste into GEE**:
   - In the GEE Code Editor, click **New** > **Script** in the script panel (top-left, red button).
   - Paste the copied code (`Ctrl+V` or `Cmd+V`).

3. **Save Your Script**:
   - Click **Save** in GEE, give your script a name (e.g., `Kenya_Covariates`), and save it to your GEE repository. It can be any name, I just suggest using a sequence, e.g., `0, 1, 2`; `a, b, c`, etc.

#### If you are new to git hub and more comfortable working locally, as **second option**, you can **download the entire project to your computer, then copy-paste to GEE**. 

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
  
### Option 2: Running the DSM Modeling Script (`2_Kenya_DSM_Modeling_sfv.js`)

The `2_Kenya_DSM_Modeling_sfv.js` script requires specific data asset `sample_points_mk_soc_0_20cm` that isn’t publicly available in GEE. You’ll need to download these from GitHub also, and upload them to your GEE account.

1. **Check for Data Files**:
   - In the unzipped GitHub folder, look for data files like shapefiles (e.g., `bbox_shp_buff_2km.shp`) or GeoTIFFs (e.g., `predictors_m_kenya_epsg_4326.tif`).
   - If these aren’t in the repository, ask your instructor for the data files.

2. **Upload Data to GEE**:
   - In the GEE Code Editor, go to the **Assets** tab (left panel).
   - Click **New** > **Table** (for shapefiles) or **Image** (for GeoTIFFs).
   - **For Shapefiles**:
     - Upload the `.shp`, `.shx`, `.dbf`, and `.prj` files together.
     - Name the asset (e.g., `bbox_shp_buff_2km`) and click **OK**.
   - **For GeoTIFFs**:
     - Upload the `.tif` file.
     - Name the asset (e.g., `predictors_m_kenya_epsg_4326`) and click **OK**.
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

4. **Copy, Paste, and Run**:
   - Copy the updated script from your text editor.
   - Paste it into a new GEE script (as described in Option 1).
   - Click **Run** to execute. The script will generate a soil organic carbon (SOC) map and metrics.

5. **Check Outputs**:
   - Look at the map for the SOC map and points.
   - Check the console for metrics like RMSE and R².
   - If you see errors, verify your asset paths and ensure the data uploaded correctly.

---


## Step 4: Exploring the Results

- **Map Outputs**: The scripts generate layers like elevation (DEM), NDVI, SAVI, and SOC maps. Toggle layers in the GEE map (top-right) to view them.
- **Console Outputs**: Check printed information like band names, resolutions, and model metrics.
- **Exported Files**: The scripts export results to your Google Drive (e.g., `Covariates_Kenya_to_drive.tif`) or GEE Assets. Check your Drive or Assets tab for these files.

---

## Useful Resources

- **GEE Datasets**: Explore available datasets at [developers.google.com/earth-engine/datasets](https://developers.google.com/earth-engine/datasets).
- **Free GEE Course**: Learn more with this [free course](https://courses.spatialthoughts.com/end-to-end-gee.html).
- **GEE Documentation**: Refer to [developers.google.com/earth-engine](https://developers.google.com/earth-engine) for help.
- **Ask for Help**: If you’re stuck, contact your instructor or classmates.

---

## Tips for Success

- **Start with `0_gee_notions.js`**: It’s a simple script to learn GEE basics.
- **Run Scripts One at a Time**: Each script builds on the previous one. Start with `0`, then `1`, then `2`.
- **Check Asset Paths**: For `2_Kenya_DSM_Modeling_sfv.js`, ensure your uploaded assets match the script paths.
- **Save Your Work**: Save scripts in GEE to avoid losing progress.
- **Be Patient**: GEE processes data in the cloud, so some tasks may take a minute or two.

---

Happy mapping! If you have questions, reach out to your instructor. Enjoy exploring Mount Kenya’s environmental data with Google Earth Engine! 🌍
