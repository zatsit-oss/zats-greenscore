#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      

      let mut builder = tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()));
      builder = builder.title("zats-greenscore App")
        .inner_size(800.0, 600.0)
        .resizable(true)
        .fullscreen(false);
      
      builder.on_navigation(|url| {
        let url_str = url.as_str();
        if url_str.starts_with("http://") || url_str.starts_with("https://") {
            if let Err(e) = open::that(url_str) {
                eprintln!("Failed to open URL: {}", e);
            }
            return false; // Prevent navigation in the webview
        }
        true // Allow other navigations
      })
      .initialization_script(r#"
        window.addEventListener('click', function(e) {
          var link = e.target.closest('a');
          if (link && link.href && (link.href.startsWith('http') || link.href.startsWith('https'))) {
            link.target = '_self';
          }
        }, true);
      "#)
      .build()?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("Error while running greenscore Tauri application");
}
